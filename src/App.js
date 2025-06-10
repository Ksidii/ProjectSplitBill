// src/App.js
import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./context/ProtectedRoute";
import { EventProvider } from "./context/EventContext";

import Layout from "./components/Layout";

import LoginScreen from "./pages/LoginScreen";
import RegisterPage from "./pages/RegisterPage";
import SignInPage from "./pages/SignInPage";
import Dashboard from "./pages/Dashboard";
import CreateEventPage from "./pages/CreateEventPage";
import EventDetailsPage from "./pages/EventDetailsPage";
import AboutPage from "./pages/AboutPage"; // <-- importujemy AboutPage

import "./App.css";

function App() {
  return (
    <AuthProvider>
      <EventProvider>
        <BrowserRouter>
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

            {/* Wszelkie inne ścieżki → przekieruj do „/” */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </BrowserRouter>
      </EventProvider>
    </AuthProvider>
  );
}

export default App;
