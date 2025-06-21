import React, { createContext, useContext, useEffect, useState } from "react";
import { auth } from "../firebase";

// Tworzymy nowy kontekst do obsługi wydarzeń
const EventContext = createContext();
// Udostępniamy hook do użycia EventContext w komponentach
export const useEvents = () => useContext(EventContext);

/* ────────────────────────────────────────────────────────── */
/*  helper – pojedyncze wywołanie chmury                     */
/*  Funkcja pomocnicza – tworzy funkcję do wywołań endpointów */
/*  Firebase Functions z autoryzacją przez token użytkownika  */
const callFnFactory = currentUser => async (path, body = null, method = "POST") => {
  const token = await currentUser.getIdToken(); // Pobieramy token JWT do autoryzacji
  const url   = `https://us-central1-splitbill-461116.cloudfunctions.net/${path}`; // Adres funkcji chmurowej (Firebase Functions)

  const opts  = { method, headers: { Authorization: `Bearer ${token}` } }; // Dodanie tokena w nagłówku jako autoryzacja
  if (body !== null) {
    opts.headers["Content-Type"] = "application/json";
    opts.body = JSON.stringify(body); // Jeśli jest body – przekazujemy jako JSON
  }

  const res = await fetch(url, opts); // Wysyłamy żądanie
  if (!res.ok) {
    const txt = await res.text(); // W przypadku błędu — odczytaj odpowiedź serwera
    throw new Error(`Server error (${res.status}): ${txt}`);
  }
  return res.json(); // Zwracamy dane w formacie JSON
};
/* ────────────────────────────────────────────────────────── */
// Komponent provider – udostępnia dane i akcje związane z wydarzeniami w całej aplikacji
export const EventProvider = ({ children }) => {
  const [events, setEvents]   = useState([]);   // wszystkie eventy
  const [friends, setFriends] = useState([]);   // lista znajomych
  const [eventsLoaded, setEventsLoaded] = useState(false); // Flaga: czy wydarzenia już pobrano

  const currentUser     = auth.currentUser; // Aktualnie zalogowany użytkownik Firebase
  const isAuthenticated = !!currentUser; // true jeśli użytkownik jest zalogowany
  const callFn          = callFnFactory(currentUser); // Tworzymy funkcję do autoryzowanych wywołań HTTP

  /* Pomocnicza funkcja do zamiany UID na e-mail użytkownika */
  const resolveName = uidOrEmail => {
    if (!uidOrEmail) return "";
    if (uidOrEmail.includes("@")) return uidOrEmail;       // Jeśli już e-mail — zwracamy

    const friend = friends.find(f => f.uid === uidOrEmail); // Szukamy wśród znajomych
    if (friend) return friend.email;

    for (const ev of events) {
      const p = ev.participants?.find(x => x.id === uidOrEmail); // Szukamy po wydarzeniach
      if (p) return p.name;
    }
    return uidOrEmail;  // fallback, gdy nie znaleziono nazwiska
  };
  /* ------------------------------------------------------ */

  /* ========== 1. Pobieranie wydarzeń po zalogowaniu użytkownika ========== */
  // Efekt pobierający wydarzenia z backendu po zalogowaniu użytkownika
  useEffect(() => {
    if (!isAuthenticated) return;
    (async () => {
      try {
        const data = await callFn("getEvents", null, "GET"); // Pobieranie listy wydarzeń

        // Transformacja danych z backendu na format wewnętrzny aplikacji
        setEvents(data.map(ev => ({
          id:   ev.eventId,
          name: ev.name,
          date: ev.createdAt,
          status: ev.status ?? "OPEN",
          participants: ev.participants.map(pid => ({
            id: pid,
            name: resolveName(pid),
          })),
          expenses: (ev.expenses || []).map(ex => ({
            id:            ex.expenseId,
            name:          ex.name,
            amount:        Number(ex.amount),
            payerId:       ex.payerId,
            payerName:     resolveName(ex.payerId),
            beneficiaries: ex.beneficiaries,
            paidBy:        ex.paidBy ?? [],
            isPaid:        ex.isPaid ?? false,
            status:        ex.status,
          })),
        })));
      } catch (err) {
        console.error("Nie udało się wczytać eventów:", err);
      } finally {
        setEventsLoaded(true); // Ustawiamy flagę, że pobrano
      }
    })();
  }, [isAuthenticated]);    // <- tylko raz po zalogowaniu

  /* ========== 2. Pobieranie listy znajomych użytkownika ========== */
  useEffect(() => {
    if (!isAuthenticated) return;
    (async () => {
      try {
        const data = await callFn("getFriends", null, "GET");
        setFriends(data);
      } catch (err) {
        console.error("Nie udało się wczytać znajomych:", err);
      }
    })();
  }, [isAuthenticated]);

  /* ================= akcje CRUD ================= */

  /* Tworzenie nowego wydarzenia */
  const createEvent = async ({ name, date, participants = [] }) => {
    const allParticipants = [
      currentUser.email,
      ...participants.filter(e => e !== currentUser.email),
    ];

    const data = await callFn("createEvent", { name, date, participants: allParticipants });

    const newEvent = {
      id:   data.eventId,
      name: data.name,
      date: data.createdAt,
      status: data.status ?? "OPEN",
      participants: data.participants.map(pid => ({ id: pid, name: resolveName(pid) })),
      expenses: [],
    };

    setEvents(prev => [...prev, newEvent]); // Dodanie do lokalnego stanu
    return newEvent.id;
  };

  /* --- Dodawanie nowego wydatku do wydarzenia ----------------------------- */
  const addExpense = async (eventId, { name, amount, payer, beneficiaries = [] }) => {
    const ex = await callFn("addExpense", {
      eventId,
      name,
      amount,
      payerId: payer.id,
      beneficiaries: beneficiaries.map(b => b.id),
    });

    setEvents(prev => prev.map(ev => {
      if (ev.id !== eventId) return ev;

      const newExpense = {
        id:            ex.expenseId,
        name:          ex.name,
        amount:        Number(ex.amount),
        payerId:       ex.payerId,
        payerName:     resolveName(ex.payerId),
        beneficiaries: ex.beneficiaries,
        paidBy:        [],
        isPaid:        false,
        status:        ex.status,
      };

      return { ...ev, expenses: [...ev.expenses, newExpense] };
    }));
  };

  /* --- Dodanie znajomego ------------------------------ */
  const addFriend = async friendEmail => {
    await callFn("addFriend", { friendEmail });
    setFriends(await callFn("getFriends", null, "GET")); // Odświeżenie listy znajomych
  };

  /* --- Dodanie uczestnika do wydarzenia ------------------------- */
  const addParticipant = async (eventId, user) => {
    await callFn("addParticipant", { eventId, userId: user.uid });
    setEvents(prev => prev.map(ev =>
      ev.id === eventId
        ? { ...ev, participants: [...ev.participants, { id: user.uid, name: user.email }] }
        : ev
    ));
  };

  /* --- Odświeżenie szczegółów wydarzenia (np. po powrocie na stronę) (pełny refresh) ------- */
  const loadEventDetails = async eventId => {
    const data = await callFn(`getEventDetails?eventId=${eventId}`, null, "GET");

    setEvents(prev => prev.map(ev => {
      if (ev.id !== eventId) return ev;

      return {
        ...ev,
        participants: data.participants.map(pid => ({ id: pid, name: resolveName(pid) })),
        expenses: data.expenses.map(ex => {
          const everyonePaid =
            (ex.paidBy || []).length &&
            ex.beneficiaries.every(b => (ex.paidBy || []).includes(b));

          return {
            id:            ex.expenseId,
            name:          ex.name,
            amount:        Number(ex.amount),
            payerId:       ex.payerId,
            payerName:     resolveName(ex.payerId),
            beneficiaries: ex.beneficiaries,
            paidBy:        ex.paidBy ?? [],
            isPaid:        everyonePaid,
            status:        everyonePaid ? "Zapłacony" : ex.status,
          };
        }),
        status: data.status ?? ev.status,
      };
    }));
  };

  /* --- Zablokowanie wydarzenia (np. po jego zakończeniu) ------------------------------ */
  const lockEvent = async eventId => {
    await callFn("lockEvent", { eventId });
    setEvents(prev => prev.map(ev =>
      ev.id === eventId ? { ...ev, status: "LOCKED" } : ev
    ));
  };

  /* --- Oznaczenie wydatku jako w pełni opłaconego (wszyscy spłacili) ---------- */
  const markExpensePaid = async (eventId, expenseId) => {
    await callFn("markExpensePaid", { eventId, expenseId });
    setEvents(prev => prev.map(ev => {
      if (ev.id !== eventId) return ev;

      const expenses = ev.expenses.map(ex =>
        ex.id === expenseId ? { ...ex, isPaid: true, status: "Zapłacony" } : ex
      );

      const finished = expenses.every(e => e.isPaid);
      return { ...ev, expenses, status: finished ? "FINISHED" : ev.status };
    }));
  };

  /* --- Użytkownik spłaca swój udział we wspólnym wydatku --------- */
  const payMyShare = async (eventId, expenseId) => {
    await callFn("markExpensePaid", { eventId, expenseId });
    setEvents(prev => prev.map(ev => {
      if (ev.id !== eventId) return ev;

      const expenses = ev.expenses.map(ex => {
        if (ex.id !== expenseId) return ex;

        const paid = Array.from(new Set([...(ex.paidBy || []), currentUser.email]));
        const everyone = ex.beneficiaries.every(b => paid.includes(b));

        return {
          ...ex,
          paidBy: paid,
          isPaid: everyone,
          status: everyone ? "Zapłacony" : ex.status,
        };
      });

      const finished = expenses.every(e => e.isPaid);
      return { ...ev, expenses, status: finished ? "FINISHED" : ev.status };
    }));
  };

  /* ========== Udostępniamy wszystkie dane i akcje poprzez kontekst / eksport do Provider’a ========== */
  return (
    <EventContext.Provider
      value={{
        events,
        friends,
        eventsLoaded,

        createEvent,
        addExpense,
        addFriend,
        addParticipant,
        loadEventDetails,
        lockEvent,
        markExpensePaid,
        payMyShare,
      }}
    >
      {children}
    </EventContext.Provider>
  );
};
