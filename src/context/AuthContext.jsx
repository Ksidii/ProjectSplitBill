
import React, { createContext, useContext, useEffect, useState } from "react";
import { auth } from "../firebase"; // Import konfiguracji Firebase
import {
  onAuthStateChanged, // Nasłuchuje zmiany stanu logowania (np. odświeżenie strony)
  signInWithEmailAndPassword, // Funkcja do logowania użytkownika
  signOut, // Funkcja do wylogowania
} from "firebase/auth";

// Tworzymy nowy kontekst Reacta, który będzie przechowywał dane uwierzytelnienia
const AuthContext = createContext();

// Własny hook umożliwiający dostęp do kontekstu w komponentach
export const useAuth = () => {
  return useContext(AuthContext);
};

// Komponent nadrzędny, który zapewnia dostęp do danych logowania w całej aplikacji
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null); // Przechowuje aktualnego zalogowanego użytkownika
    const [loading, setLoading] = useState(true); // Flaga informująca, czy trwa sprawdzanie stanu logowania
  
 
    useEffect(() => {
      // Funkcja onAuthStateChanged nasłuchuje zmiany logowania użytkownika
      const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
        setUser(firebaseUser); // Ustawiamy użytkownika po zalogowaniu
        setLoading(false); // Kończymy ładowanie po pierwszym sprawdzeniu sesji
      });
      // Zwracamy unsubscribe — funkcję czyszczącą nasłuchiwanie przy odmontowaniu komponentu
      return unsubscribe;
    }, []);
  
 // Funkcja logowania – przyjmuje e-mail i hasło i korzysta z Firebase Auth
    const login = (email, password) => {
      return signInWithEmailAndPassword(auth, email, password);
    };
  
// Funkcja wylogowująca użytkownika
    const logout = () => {
      return signOut(auth);
    };

  // Wartości przekazywane do kontekstu – dostępne we wszystkich komponentach aplikacji
    const value = {
      user,                      // Obiekt użytkownika (null jeśli nie zalogowany)
      isAuthenticated: !!user,   // Zwraca true/false na podstawie obecności użytkownika
      login,                     // Funkcja logowania
      logout,                    // Funkcja wylogowania
    };
  
    return (
      // Dostarczamy dane kontekstowe tylko po zakończeniu sprawdzania stanu logowania
      <AuthContext.Provider value={value}>
        {!loading && children}
      </AuthContext.Provider>
    );
  };
