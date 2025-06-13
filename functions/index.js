
const functions   = require("firebase-functions");
const admin       = require("firebase-admin");
const { Spanner } = require("@google-cloud/spanner");
const { v4: uuid }= require("uuid");
const cors        = require("cors")({ origin: true });

admin.initializeApp();


function getDb() {
  const spanner  = new Spanner({ projectId: process.env.GCP_PROJECT });
  const inst     = spanner.instance("splitbill-instancja");
  return inst.database("splitbill_db");
}


async function normalizeBeneficiaries(beneficiaries = []) {
  const result = [];
  for (const id of beneficiaries) {
    if (typeof id === "string" && id.includes("@")) {
      const user = await admin.auth().getUserByEmail(id).catch(() => null);
      if (!user) throw new Error(`User ${id} not found`);
      result.push(user.uid);
    } else {
      result.push(id);  
    }
  }
  return result;
}


exports.getEvents = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
 
    if (req.method !== 'GET') return res.status(405).send('Only GET allowed');

   
    const token = (req.headers.authorization || '').split('Bearer ')[1] || '';
    if (!token) return res.status(401).send('No auth token');

    let decoded;
    try {
      decoded = await admin.auth().verifyIdToken(token);
    } catch {
      return res.status(401).send('Invalid token');
    }
    const uid = decoded.uid;

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



exports.createEvent = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    if (req.method !== "POST") {
      return res.status(405).send("Only POST allowed");
    }
    const token = (req.headers.authorization || "").split("Bearer ")[1] || "";
    if (!token) return res.status(401).send("No auth token");
    let decoded;
    try {
      decoded = await admin.auth().verifyIdToken(token);
    } catch {
      return res.status(401).send("Invalid token");
    }

    const { name, date, participants = [] } = req.body;
    if (!name) {
      return res.status(400).send("Missing name");
    }

    const db        = getDb();
    const eventId   = uuid();
    const createdAt = Spanner.timestamp(new Date());

    await db.table("Events").insert({
      EventId:   eventId,
      OwnerId:   decoded.uid,
      Name:      name,
      Status: 'OPEN',
      CreatedAt: createdAt
    });

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


exports.addExpense = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    if (req.method !== 'POST') return res.status(405).send('Only POST allowed');


    const token = (req.headers.authorization || '').split('Bearer ')[1] || '';
    if (!token) return res.status(401).send('No auth token');
    const decoded = await admin.auth().verifyIdToken(token)
                      .catch(() => null);
    if (!decoded) return res.status(401).send('Invalid token');


    const { eventId, name, amount, payerId, beneficiaries = [] } = req.body;
    if (!eventId || !name || !amount || !payerId)
      return res.status(400).send('Missing parameters');
    if (typeof amount !== 'number' || amount <= 0)
      return res.status(400).send('Invalid amount');

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

exports.lockEvent = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    if (req.method !== "POST") return res.status(405).send("Only POST");
    const token = (req.headers.authorization || "").split("Bearer ")[1] || "";
    const { eventId } = req.body;
    await admin.auth().verifyIdToken(token);  
    await getDb().table("Events")
      .update({ EventId: eventId, Status: "LOCKED" });
    res.json({ success: true });
  });
});






exports.getFriends = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    if (req.method !== "GET") return res.status(405).send("Only GET allowed");
    const token = (req.headers.authorization||"").split("Bearer ")[1] || "";
    if (!token) return res.status(401).send("No auth token");
    let decoded;
    try {
      decoded = await admin.auth().verifyIdToken(token);
    } catch {
      return res.status(401).send("Invalid token");
    }


    const db = getDb();
    const sql = `
      SELECT FriendId
        FROM Friends
       WHERE UserId = @uid
    `;
    const [rows] = await db.run({ sql, params: { uid: decoded.uid } });
    const uids = rows.map(r => r.toJSON().FriendId);
    if (uids.length === 0) return res.json([]);


    const list = await admin.auth().getUsers(uids.map(uid=>({ uid })));

    const friends = list.users.map(u => ({
      uid:   u.uid,
      email: u.email,
      name:  u.displayName || null,
    }));
    res.json(friends);
  });
});


exports.addFriend = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    if (req.method !== "POST") return res.status(405).send("Only POST allowed");

    const idToken = (req.headers.authorization || "").split("Bearer ")[1] || "";
    if (!idToken) return res.status(401).send("No auth token");
    let decoded;
    try {
      decoded = await admin.auth().verifyIdToken(idToken);
    } catch {
      return res.status(401).send("Invalid token");
    }


    let { friendEmail } = req.body;
    if (friendEmail && typeof friendEmail === 'object' && friendEmail.friendEmail) {
      friendEmail = friendEmail.friendEmail;
    }
    if (!friendEmail || typeof friendEmail !== 'string') {
      return res.status(400).send("Missing or invalid friendEmail");
    }


    let friendUser;
    try {
      friendUser = await admin.auth().getUserByEmail(friendEmail);
    } catch {
      return res.status(404).send("User with that email not found");
    }

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

    const { eventId, userId } = req.body;
    if (!eventId || !userId)
      return res.status(400).send("Missing eventId or userId");

    const db = getDb(); 
    const table = db.table("Participants");


    await table.insert({ EventId: eventId, UserId: userId });

    return res.json({ success: true });
  });
});

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

 
    const [eventRows] = await db.run({
      sql: `SELECT * FROM Events WHERE EventId = @eventId`,
      params: { eventId }
    });

    if (eventRows.length === 0) return res.status(404).send("Event not found");
    const event = eventRows[0].toJSON();

  
    const [participantsRows] = await db.run({
      sql: `SELECT UserId FROM Participants WHERE EventId = @eventId`,
      params: { eventId }
    });
    const participants = participantsRows.map(r => r.toJSON().UserId);

  
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

exports.markExpensePaid = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    if (req.method !== 'POST') return res.status(405).send('Only POST');

    const token = (req.headers.authorization || '').split('Bearer ')[1] || '';
    const { eventId, expenseId } = req.body;
    if (!eventId || !expenseId) return res.status(400).send('Missing params');


    const { uid } = await admin.auth().verifyIdToken(token);
    const db = getDb();

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