// src/context/EventContext.jsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";

const EventContext = createContext();

export const useEvents = () => {
  return useContext(EventContext);
};

export const EventProvider = ({ children }) => {
  // 1) Zacznijmy od wczytania wszystkich wydarzeń z localStorage (jeśli są)
  const [events, setEvents] = useState(() => {
    try {
      const stored = localStorage.getItem("splitbill_events");
      return stored ? JSON.parse(stored) : [];
    } catch (err) {
      console.error("Błąd przy wczytywaniu wydarzeń:", err);
      return [];
    }
  });

  // 2) Za każdym razem, gdy 'events' się zmieni, zapisujemy nowe 'events' w localStorage
  useEffect(() => {
    try {
      localStorage.setItem("splitbill_events", JSON.stringify(events));
    } catch (err) {
      console.error("Błąd przy zapisywaniu wydarzeń:", err);
    }
  }, [events]);

  // 3) Funkcja tworząca nowe wydarzenie (już istniała)
  const createEvent = ({ name, date, participants = [] }) => {
    const newEvent = {
      id: uuidv4(),
      name,
      date,
      participants,
      expenses: [], // początkowo pusta lista wydatków
    };
    setEvents((prev) => [...prev, newEvent]);
    return newEvent.id;
  };

  // 4) NOWA Funkcja dodająca wydatek do konkretnego wydarzenia
  //    Wywołujemy ją z EventDetailsPage, podając: eventId, oraz obiekt expense
  const addExpense = (eventId, { name, amount, payer, beneficiaries }) => {
    setEvents((prevEvents) => {
      // Znajdźmy wydarzenie, do którego dodajemy wydatek
      return prevEvents.map((evt) => {
        if (evt.id === eventId) {
          // Stwórzmy nowy obiekt wydatku
          const newExpense = {
            id: uuidv4(),
            name,
            amount,
            payerId: payer.id,
            payerName: payer.name,
            beneficiaries: beneficiaries.map((b) => b.name), // tablica samych nazw
            status: "Oczekuje", // domyślny status
          };
          // Dodajmy ten wydatek do kopii tablicy istniejących wydatków
          return {
            ...evt,
            expenses: [...evt.expenses, newExpense],
          };
        }
        return evt;
      });
    });
  };

  const value = {
    events,
    createEvent,
    addExpense, // udostępniamy nową funkcję w kontekście
  };

  return <EventContext.Provider value={value}>{children}</EventContext.Provider>;
};
