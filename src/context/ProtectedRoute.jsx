// src/context/ProtectedRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

/**
 * ProtectedRoute otacza w Routes komponent, który chcemy chronić.
 * Jeśli użytkownik nie jest zalogowany (isAuthenticated = false),
 * to przenosi go na "/signin" (lub inną wskazaną trasę).
 */
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    // jeśli nie jesteśmy zalogowani, przekieruj na stronę logowania
    return <Navigate to="/signin" replace />;
  }

  // w przeciwnym razie wypuść zawartość "children"
  return children;
};

export default ProtectedRoute;
