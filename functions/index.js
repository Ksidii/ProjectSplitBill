// Import bibliotek Firebase oraz zależności zewnętrznych
const functions   = require("firebase-functions");
const admin       = require("firebase-admin");
const { Spanner } = require("@google-cloud/spanner");
const { v4: uuid }= require("uuid");
const cors        = require("cors")({ origin: true });

// Inicjalizacja aplikacji Firebase Admin SDK
admin.initializeApp();

// Funkcja pomocnicza do połączenia z bazą danych Spanner
function getDb() {
  const spanner  = new Spanner({ projectId: process.env.GCP_PROJECT });
  const inst     = spanner.instance("splitbill-instancja");
  return inst.database("splitbill_db");
}

// Zamiana adresów e-mail beneficjentów na UID-y Firebase
async function normalizeBeneficiaries(beneficiaries = []) {
  const result = [];
  for (const id of beneficiaries) {
    if (typeof id === "string" && id.includes("@")) {
      const user = await admin.auth().getUserByEmail(id).catch(() => null);
      if (!user) throw new Error(`User ${id} not found`);
      result.push(user.uid);
    } else {
      result.push(id);  // już jest UID
    }
  }
  return result;
}

// Endpoint: Pobieranie wydarzeń, w których użytkownik jest właścicielem lub uczestnikiem
exports.getEvents = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
 
    if (req.method !== 'GET') return res.status(405).send('Only GET allowed');

   // Weryfikacja tokena JWT
    const token = (req.headers.authorization || '').split('Bearer ')[1] || '';
    if (!token) return res.status(401).send('No auth token');

    let decoded;
    try {
      decoded = await admin.auth().verifyIdToken(token);
    } catch {
      return res.status(401).send('Invalid token');
    }
    const uid = decoded.uid;

    // Zapytanie SQL do pobrania wydarzeń
    /* pobieramy tylko wydarzenia, w których user jest ownerem LUB uczestnikiem */
    const sql = `
      SELECT e.EventId,
             e.OwnerId,
             e.Name,
             e.Status,
             e.CreatedAt,
             p.UserId AS ParticipantId     -- może być NULL, jeśli owner nie jest w Participants
        FROM Events e
   LEFT JOIN Participants p USING(EventId)
       WHERE e.OwnerId = @uid
          OR p.UserId  = @uid
    `;
    const [rows] = await getDb().run({ sql, params: { uid } });

    /* grupujemy, żeby jedno wydarzenie z wieloma participantami nie dublowało się w tablicy */
    const events = {};
    rows.forEach(r => {
      const row = r.toJSON();
      if (!events[row.EventId]) {
        events[row.EventId] = {
          eventId:     row.EventId,
          ownerId:     row.OwnerId,
          name:        row.Name,
          status:      row.Status,
          createdAt:   row.CreatedAt,
          participants: []
        };
      }
      if (row.ParticipantId) {
        events[row.EventId].participants.push(row.ParticipantId);
      }
    });

    res.json(Object.values(events));
  });
});


// Endpoint: Tworzenie wydarzenia
exports.createEvent = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    if (req.method !== "POST") {
      return res.status(405).send("Only POST allowed");
    }
    // Weryfikacja tokena JWT
    const token = (req.headers.authorization || "").split("Bearer ")[1] || "";
    if (!token) return res.status(401).send("No auth token");
    let decoded;
    try {
      decoded = await admin.auth().verifyIdToken(token);
    } catch {
      return res.status(401).send("Invalid token");
    }

    // Walidacja danych wejściowych
    const { name, date, participants = [] } = req.body;
    if (!name) {
      return res.status(400).send("Missing name");
    }

    const db        = getDb();
    const eventId   = uuid();
    const createdAt = Spanner.timestamp(new Date());

    // Zapis wydarzenia do bazy
    await db.table("Events").insert({
      EventId:   eventId,
      OwnerId:   decoded.uid,
      Name:      name,
      Status: 'OPEN',
      CreatedAt: createdAt
    });

    // Dodanie uczestników (jeśli są)
    if (participants.length) {
      const rows = participants.map(uid => ({
        EventId: eventId,
        UserId:  uid
      }));
      await db.table("Participants").insert(rows);
    }

    res.json({ eventId, ownerId: decoded.uid, name, date, participants, status: 'OPEN', createdAt: createdAt.value });
  });
});

// Endpoint: Dodawanie wydatku
exports.addExpense = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    if (req.method !== 'POST') return res.status(405).send('Only POST allowed');


    const token = (req.headers.authorization || '').split('Bearer ')[1] || '';
    if (!token) return res.status(401).send('No auth token');
    const decoded = await admin.auth().verifyIdToken(token)
                      .catch(() => null);
    if (!decoded) return res.status(401).send('Invalid token');


    // Walidacja danych
    const { eventId, name, amount, payerId, beneficiaries = [] } = req.body;
    if (!eventId || !name || !amount || !payerId)
      return res.status(400).send('Missing parameters');
    if (typeof amount !== 'number' || amount <= 0)
      return res.status(400).send('Invalid amount');

     // Zamiana e-maili na UID-y
    let beneficiariesUid;                      
    try {
      beneficiariesUid = await normalizeBeneficiaries(beneficiaries);
      const filtered = beneficiariesUid.filter(uid => uid !== payerId);
    } catch (err) {
      return res.status(400).send(err.message); 
    }


    const db        = getDb();
    const expenseId = uuid();
    const createdAt = Spanner.timestamp(new Date());

    // Wstawienie rekordu wydatku
    await db.table('Expenses').insert({
      ExpenseId: expenseId,
      EventId:   eventId,
      Name:      name,
      Amount:    amount,
      PaidBy:    payerId,    
      IsPaid:    false,
      Status:    'PENDING',
      CreatedAt: createdAt,
    });

    // Wstawienie użytkowników jako beneficjentów wydatku
    if (beneficiariesUid.length) {
      const rows = beneficiariesUid.map(uid => ({
        EventId:   eventId,
        ExpenseId: expenseId,
        UserId:    uid,     
        IsPaid:    false,
      }));
      await db.table('ExpenseUsage').insert(rows);
    }

    res.json({
      expenseId,
      eventId,
      name,
      amount,
      payerId,
      beneficiaries: beneficiariesUid,
      status: 'PENDING',
      isPaid: false,
      createdAt: createdAt.value,
    });
  });
});

// Funkcja zmienia status wydarzenia na "LOCKED"
exports.lockEvent = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    // Sprawdzenie metody HTTP
    if (req.method !== "POST") return res.status(405).send("Only POST");
    // Autoryzacja – wyciągnięcie tokenu z nagłówków
    const token = (req.headers.authorization || "").split("Bearer ")[1] || "";
    const { eventId } = req.body;
     // Weryfikacja tokenu
    await admin.auth().verifyIdToken(token);  
    // Aktualizacja statusu eventu w bazie
    await getDb().table("Events")
      .update({ EventId: eventId, Status: "LOCKED" });
    res.json({ success: true });
  });
});





// Funkcja pobiera listę znajomych aktualnie zalogowanego użytkownika
exports.getFriends = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    // Sprawdzenie metody
    if (req.method !== "GET") return res.status(405).send("Only GET allowed");
     // Pobranie i weryfikacja tokenu autoryzacyjnego
    const token = (req.headers.authorization||"").split("Bearer ")[1] || "";
    if (!token) return res.status(401).send("No auth token");
    let decoded;
    try {
      decoded = await admin.auth().verifyIdToken(token);
    } catch {
      return res.status(401).send("Invalid token");
    }


    const db = getDb();
    // SQL do pobrania UID znajomych
    const sql = `
      SELECT FriendId
        FROM Friends
       WHERE UserId = @uid
    `;
    const [rows] = await db.run({ sql, params: { uid: decoded.uid } });
    const uids = rows.map(r => r.toJSON().FriendId);
    // Jeśli użytkownik nie ma żadnych znajomych
    if (uids.length === 0) return res.json([]);


    // Pobranie danych użytkowników po UID
    const list = await admin.auth().getUsers(uids.map(uid=>({ uid })));

    // Konwersja na tablicę obiektów
    const friends = list.users.map(u => ({
      uid:   u.uid,
      email: u.email,
      name:  u.displayName || null,
    }));
    res.json(friends);
  });
});

// Funkcja dodaje znajomego do listy
exports.addFriend = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    if (req.method !== "POST") return res.status(405).send("Only POST allowed");

    // Autoryzacja
    const idToken = (req.headers.authorization || "").split("Bearer ")[1] || "";
    if (!idToken) return res.status(401).send("No auth token");
    let decoded;
    try {
      decoded = await admin.auth().verifyIdToken(idToken);
    } catch {
      return res.status(401).send("Invalid token");
    }


    // Obsługa sytuacji, gdzie obiekt ma zagnieżdżony email
    let { friendEmail } = req.body;
    if (friendEmail && typeof friendEmail === 'object' && friendEmail.friendEmail) {
      friendEmail = friendEmail.friendEmail;
    }
    // Walidacja parametru email
    if (!friendEmail || typeof friendEmail !== 'string') {
      return res.status(400).send("Missing or invalid friendEmail");
    }


    // Pobieranie użytkownika po emailu
    let friendUser;
    try {
      friendUser = await admin.auth().getUserByEmail(friendEmail);
    } catch {
      return res.status(404).send("User with that email not found");
    }

    // Symetryczne zapisywanie relacji znajomości
    const uid1 = decoded.uid;
    const uid2 = friendUser.uid;
    const COMMIT_TS = Spanner.COMMIT_TIMESTAMP;
    const table = getDb().table("Friends");


    await table.insert([
      { UserId: uid1, FriendId: uid2, CreatedAt: COMMIT_TS },
      { UserId: uid2, FriendId: uid1, CreatedAt: COMMIT_TS },
    ]);

    res.json({ success: true });
  });
});


// Dodanie uczestnika do wydarzenia
exports.addParticipant = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    if (req.method !== "POST")
      return res.status(405).send("Only POST allowed");

    const token = (req.headers.authorization || "").split("Bearer ")[1] || "";
    if (!token) return res.status(401).send("No auth token");

    let decoded;
    try {
      decoded = await admin.auth().verifyIdToken(token);
    } catch {
      return res.status(401).send("Invalid token");
    }

    // Walidacja danych wejściowych
    const { eventId, userId } = req.body;
    if (!eventId || !userId)
      return res.status(400).send("Missing eventId or userId");

    const db = getDb(); 
    const table = db.table("Participants");


    await table.insert({ EventId: eventId, UserId: userId });

    return res.json({ success: true });
  });
});

// Pobranie szczegółów wydarzenia: uczestnicy i wydatki
exports.getEventDetails = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    if (req.method !== "GET") return res.status(405).send("Only GET allowed");

    const token = (req.headers.authorization || "").split("Bearer ")[1] || "";
    if (!token) return res.status(401).send("No auth token");

    let decoded;
    try {
      decoded = await admin.auth().verifyIdToken(token);
    } catch {
      return res.status(401).send("Invalid token");
    }

    const eventId = req.query.eventId;
    if (!eventId) return res.status(400).send("Missing eventId");

    const db = getDb();


    // 1. Wczytaj wydarzenie
    const [eventRows] = await db.run({
      sql: `SELECT * FROM Events WHERE EventId = @eventId`,
      params: { eventId }
    });

    if (eventRows.length === 0) return res.status(404).send("Event not found");
    const event = eventRows[0].toJSON();


    // 2. Wczytaj uczestników
    const [participantsRows] = await db.run({
      sql: `SELECT UserId FROM Participants WHERE EventId = @eventId`,
      params: { eventId }
    });
    const participants = participantsRows.map(r => r.toJSON().UserId);


    // 3. Wczytaj wydatki i beneficjentów
    const [expenseRows] = await db.run({
      sql: `
        SELECT e.ExpenseId, e.Amount, e.PaidBy, e.Status, e.isPaid, e.Name,
               eu.UserId AS Beneficiary
          FROM Expenses e
          LEFT JOIN ExpenseUsage eu
            ON e.ExpenseId = eu.ExpenseId AND e.EventId = eu.EventId
         WHERE e.EventId = @eventId
      `,
      params: { eventId }
    });

    // Grupowanie wydatków i ich beneficjentów
    const expensesMap = {};
    expenseRows.forEach(r => {
      const row = r.toJSON();
      if (!expensesMap[row.ExpenseId]) {
        expensesMap[row.ExpenseId] = {
          expenseId: row.ExpenseId,
          name: row.Name,
          amount: row.Amount,
          payerId: row.PaidBy,
          status: row.Status,
          beneficiaries: []
        };
      }
      if (row.Beneficiary) {
        expensesMap[row.ExpenseId].beneficiaries.push(row.Beneficiary);
      }
    });

    const expenses = Object.values(expensesMap);

    res.json({
      eventId: event.EventId,
      name: event.Name,
      createdAt: event.CreatedAt,
      participants,
      status:  event.Status,
      expenses
    });
  });
});

// Oznacza wydatek jako zapłacony przez aktualnego użytkownika
exports.markExpensePaid = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    if (req.method !== 'POST') return res.status(405).send('Only POST');

    const token = (req.headers.authorization || '').split('Bearer ')[1] || '';
    const { eventId, expenseId } = req.body;
    if (!eventId || !expenseId) return res.status(400).send('Missing params'); // Sprawdzenie parametrów wejściowych


    const { uid } = await admin.auth().verifyIdToken(token);
    const db = getDb();

    // Oznaczenie udziału użytkownika jako zapłaconego
    try {
      await db.table('ExpenseUsage').update({
        EventId:   eventId,
        ExpenseId: expenseId,
        UserId:    uid,
        IsPaid:    true,
      });
    } catch (err) {
      return res.status(404).send('Nothing to mark as paid');
    }

    /* 2. czy wszyscy dłużnicy zapłacili ten wydatek? */
    const [left] = await db.run({
      sql: `SELECT COUNT(*) AS cnt
              FROM ExpenseUsage
             WHERE EventId=@e AND ExpenseId=@x AND IsPaid=FALSE`,
      params: { e: eventId, x: expenseId },
    });
    // Jeśli tak, aktualizuj status wydatku
    if (Number(left[0].toJSON().cnt) === 0) {
      await db.table('Expenses').update({
        EventId:   eventId,
        ExpenseId: expenseId,
        IsPaid:    true,
        Status:    'PAID',
      });
    }

    /* 3. czy całe wydarzenie jest już opłacone? */
    const [open] = await db.run({
      sql: `SELECT COUNT(*) AS openCnt
              FROM Expenses
             WHERE EventId=@e AND IsPaid=FALSE`,
      params: { e: eventId },
    });
    if (Number(open[0].toJSON().openCnt) === 0) {
      await db.table('Events').update({
        EventId: eventId,
        Status:  'FINISHED',
      });
    }

    res.json({ success: true });
  });
});
