// src/App.js
import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Konteksty – zarządzanie autoryzacją i wydarzeniami
import { AuthProvider } from "./context/AuthContext"; // dostarcza informacje o zalogowanym użytkowniku
import ProtectedRoute from "./context/ProtectedRoute"; // komponent do ochrony tras (tylko po zalogowaniu)
import { EventProvider } from "./context/EventContext"; // dostarcza informacje o eventach i znajomych

import Layout from "./components/Layout";

import LoginScreen from "./pages/LoginScreen";
import RegisterPage from "./pages/RegisterPage";
import SignInPage from "./pages/SignInPage";
import Dashboard from "./pages/Dashboard";
import CreateEventPage from "./pages/CreateEventPage";
import EventDetailsPage from "./pages/EventDetailsPage";
import AboutPage from "./pages/AboutPage"; 

import "./App.css";

function App() {
  return (
    // Dostarczenie kontekstu autoryzacji do całej aplikacji
    <AuthProvider>
      // Dostarczenie kontekstu wydarzeń i znajomych
      <EventProvider>
        // Umożliwienie obsługi tras za pomocą URL-a
        <BrowserRouter>
          // Definicja tras (ścieżek URL)
          <Routes>
            {/* ---------------- */}
            {/* Strony publiczne */}
            <Route path="/" element={<LoginScreen />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/signin" element={<SignInPage />} />

            {/* ---------------- */}
            {/* Strony chronione – wszystkie opakowane w Layout */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Dashboard />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/create-event"
              element={
                <ProtectedRoute>
                  <Layout>
                    <CreateEventPage />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/event/:eventId"
              element={
                <ProtectedRoute>
                  <Layout>
                    <EventDetailsPage />
                  </Layout>
                </ProtectedRoute>
              }
            />

            {/* ---------------- */}
            {/* Nowa trasa: „O nas” */}
            <Route
              path="/about"
              element={
                <ProtectedRoute>
                  <Layout>
                    <AboutPage />
                  </Layout>
                </ProtectedRoute>
              }
            />

            {/* ========== DOMYŚLNE PRZEKIEROWANIE ========== */}
            {/* Wszelkie inne ścieżki → przekieruj do „/” - Jeżeli użytkownik wejdzie na nieznaną ścieżkę, zostanie przekierowany na stronę główną */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </BrowserRouter>
      </EventProvider>
    </AuthProvider>
  );
}

export default App;
