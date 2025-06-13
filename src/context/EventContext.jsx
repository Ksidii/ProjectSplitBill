import React, { createContext, useContext, useEffect, useState } from "react";
import { auth } from "../firebase";

const EventContext = createContext();
export const useEvents = () => useContext(EventContext);

/* ────────────────────────────────────────────────────────── */
/*  helper – pojedyncze wywołanie chmury                     */
const callFnFactory = currentUser => async (path, body = null, method = "POST") => {
  const token = await currentUser.getIdToken();
  const url   = `https://us-central1-splitbill-461116.cloudfunctions.net/${path}`;

  const opts  = { method, headers: { Authorization: `Bearer ${token}` } };
  if (body !== null) {
    opts.headers["Content-Type"] = "application/json";
    opts.body = JSON.stringify(body);
  }

  const res = await fetch(url, opts);
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Server error (${res.status}): ${txt}`);
  }
  return res.json();
};
/* ────────────────────────────────────────────────────────── */

export const EventProvider = ({ children }) => {
  const [events, setEvents]   = useState([]);   // wszystkie eventy
  const [friends, setFriends] = useState([]);   // lista znajomych
  const [eventsLoaded, setEventsLoaded] = useState(false);

  const currentUser     = auth.currentUser;
  const isAuthenticated = !!currentUser;
  const callFn          = callFnFactory(currentUser);

  /* ---------- pomocniczo: zamiana uid ↔︎ email ---------- */
  const resolveName = uidOrEmail => {
    if (!uidOrEmail) return "";
    if (uidOrEmail.includes("@")) return uidOrEmail;       // to już e-mail

    const friend = friends.find(f => f.uid === uidOrEmail);
    if (friend) return friend.email;

    for (const ev of events) {
      const p = ev.participants?.find(x => x.id === uidOrEmail);
      if (p) return p.name;
    }
    return uidOrEmail;                                     // fallback
  };
  /* ------------------------------------------------------ */

  /* ========== 1. pobranie wydarzeń ========== */
  useEffect(() => {
    if (!isAuthenticated) return;
    (async () => {
      try {
        const data = await callFn("getEvents", null, "GET");

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
        setEventsLoaded(true);
      }
    })();
  }, [isAuthenticated]);    // <- tylko raz po zalogowaniu

  /* ========== 2. pobranie znajomych ========== */
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

  /* --- createEvent ----------------------------- */
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

    setEvents(prev => [...prev, newEvent]);
    return newEvent.id;
  };

  /* --- addExpense ----------------------------- */
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

  /* --- addFriend ------------------------------ */
  const addFriend = async friendEmail => {
    await callFn("addFriend", { friendEmail });
    setFriends(await callFn("getFriends", null, "GET"));
  };

  /* --- addParticipant ------------------------- */
  const addParticipant = async (eventId, user) => {
    await callFn("addParticipant", { eventId, userId: user.uid });
    setEvents(prev => prev.map(ev =>
      ev.id === eventId
        ? { ...ev, participants: [...ev.participants, { id: user.uid, name: user.email }] }
        : ev
    ));
  };

  /* --- loadEventDetails (pełny refresh) ------- */
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

  /* --- lockEvent ------------------------------ */
  const lockEvent = async eventId => {
    await callFn("lockEvent", { eventId });
    setEvents(prev => prev.map(ev =>
      ev.id === eventId ? { ...ev, status: "LOCKED" } : ev
    ));
  };

  /* --- markExpensePaid (pełny koszt) ---------- */
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

  /* --- payMyShare (pojedynczy udział) --------- */
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

  /* ========== eksport do Provider’a ========== */
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
