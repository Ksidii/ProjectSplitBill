// src/context/AuthContext.jsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { auth } from "../firebase";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
// 1) Tworzymy kontekst
const AuthContext = createContext();

// 2) Hook do łatwego korzystania z kontekstu w komponentach
export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
  
    // Nasłuchujemy, czy Firebase zmienia stan uwierzytelnienia
    useEffect(() => {
      const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
        setUser(firebaseUser);
        setLoading(false);
      });
      return unsubscribe; // cleanup
    }, []);
  
    // Funkcja logowania, która przyjmuje e-mail i hasło
    const login = (email, password) => {
      return signInWithEmailAndPassword(auth, email, password);
    };
  
    // Funkcja wylogowania
    const logout = () => {
      return signOut(auth);
    };
  
    const value = {
      user,                      // obiekt Firebase User lub null
      isAuthenticated: !!user,   // boolean
      login,                     // funkcja do logowania
      logout,                    // funkcja do wylogowania
    };
  
    return (
      <AuthContext.Provider value={value}>
        {!loading && children}
      </AuthContext.Provider>
    );
  };