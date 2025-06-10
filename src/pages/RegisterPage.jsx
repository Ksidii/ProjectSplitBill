// src/pages/RegisterPage.jsx
import React, { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

const RegisterPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    // Prosta walidacja: czy hasła są takie same
    if (password !== confirmPassword) {
      setError("Hasła nie są zgodne");
      return;
    }

    // TODO: Tutaj możesz w przyszłości zrobić request do backendu,
    // np. fetch("/api/register", …) i obsłużyć odpowiedź. 
    // Na razie po prostu przekierowujemy do strony logowania:

    navigate("/signin");
  };

  return (
    <Box
      sx={{
        width: "100vw",
        height: "100vh",
        backgroundImage:
          "linear-gradient(rgba(0, 100, 80, 0.4), rgba(0, 100, 80, 0.4)), url('/images/background.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          width: "100%",
          maxWidth: "360px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 2,
        }}
      >
        {/* Logo w kółku */}
        <Box
          sx={{
            width: 100,
            height: 100,
            borderRadius: "50%",
            backgroundColor: "rgba(255,255,255,0.9)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Box
            component="img"
            src="/images/logo.png"
            alt="Logo SplitBill"
            sx={{
              width: 56,
              height: 56,
            }}
          />
        </Box>

        {/* Tytuł aplikacji */}
        <Typography
          variant="h4"
          component="h1"
          sx={{
            color: "#ffffff",
            fontWeight: 700,
            mt: 1,
          }}
        >
          SplitBill
        </Typography>

        {/* Podtytuł */}
        <Typography
          variant="h6"
          component="h2"
          sx={{
            color: "#ffffff",
            fontWeight: 500,
          }}
        >
          Zarejestruj się
        </Typography>

        {/* E-mail */}
        <TextField
          label="E-mail"
          type="email"
          variant="filled"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          fullWidth
          sx={{
            backgroundColor: "rgba(255,255,255,0.9)",
            borderRadius: 2,
            "& .MuiFilledInput-root": {
              borderRadius: 2,
            },
            input: {
              padding: "12px",
            },
          }}
        />

        {/* Hasło */}
        <TextField
          label="Hasło"
          type="password"
          variant="filled"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          fullWidth
          sx={{
            backgroundColor: "rgba(255,255,255,0.9)",
            borderRadius: 2,
            "& .MuiFilledInput-root": {
              borderRadius: 2,
            },
            input: {
              padding: "12px",
            },
          }}
        />

        {/* Potwierdź hasło */}
        <TextField
          label="Potwierdź hasło"
          type="password"
          variant="filled"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          fullWidth
          sx={{
            backgroundColor: "rgba(255,255,255,0.9)",
            borderRadius: 2,
            "& .MuiFilledInput-root": {
              borderRadius: 2,
            },
            input: {
              padding: "12px",
            },
          }}
        />

        {/* Jeżeli jest błąd walidacji (hasła nie takie same) */}
        {error && (
          <Typography
            sx={{
              color: "#ff6666",
              fontSize: "0.9rem",
              alignSelf: "flex-start",
            }}
          >
            {error}
          </Typography>
        )}

        {/* Przycisk rejestracji */}
        <Button
          type="submit"
          variant="contained"
          sx={{
            mt: 1,
            mb: 2,
            backgroundColor: "#2ecc71",
            color: "#ffffff",
            textTransform: "none",
            fontWeight: 600,
            borderRadius: "25px",
            px: 4,
            py: 1.5,
            "&:hover": {
              backgroundColor: "#27ae60",
            },
          }}
          fullWidth
        >
          Utwórz konto
        </Button>

        {/* Przypisy na dole ekranu */}
        <Box
          sx={{
            position: "absolute",
            bottom: 16,
            left: 16,
            right: 16,
            textAlign: "center",
          }}
        >
          <Typography
            variant="caption"
            component="p"
            sx={{ color: "#ffffff", opacity: 0.8, mb: 0.5 }}
          >
            * Utworzenie konta jest konieczne do utrzymania dostępu do aplikacji
          </Typography>
          <Typography
            variant="caption"
            component="p"
            sx={{ color: "#ffffff", opacity: 0.6 }}
          >
            * Background designed by jcomp / Freepik
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default RegisterPage;
