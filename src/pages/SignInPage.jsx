// src/pages/SignInPage.jsx
import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Checkbox,
  FormControlLabel,
  Link,
  CircularProgress,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const SignInPage = () => {
  const { user, isAuthenticated, login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Jeśli już jest zalogowany → przekieruj na /dashboard
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Admin fallback – jeśli wpisano admin@admin.com / admin
    if (email === "admin@admin.com" && password === "admin") {
      // Możesz tutaj zamiast login() wstawić dowolną logikę
      // W tym przykładzie po prostu ustawiamy usera w kontekście ręcznie
      await login("admin@admin.com", "admin"); // lub osobny warunek
      navigate("/dashboard");
      return;
    }

    try {
      // Wywołanie Firebase Auth
      // Opcjonalnie: rememberMe → persistence to local/session
      // Możesz skonfigurować persistence np. w komponentDidMount kontekstu:
      // firebase.auth().setPersistence(rememberMe ? firebase.auth.Auth.Persistence.LOCAL : firebase.auth.Auth.Persistence.SESSION);
      await login(email, password);
      navigate("/dashboard");
    } catch (err) {
      console.error("Błąd logowania:", err);
      // Możesz rozwinąć, które kody error.code wyświetlają jaki komunikat
      switch (err.code) {
        case "auth/invalid-email":
          setError("Nieprawidłowy format adresu e-mail.");
          break;
        case "auth/user-not-found":
          setError("Nie znaleziono użytkownika o takim adresie e-mail.");
          break;
        case "auth/wrong-password":
          setError("Nieprawidłowe hasło.");
          break;
        case "auth/user-disabled":
          setError("Konto zostało zablokowane.");
          break;
        default:
          setError("Wystąpił błąd podczas logowania.");
          break;
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        width: "100%",
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
          gap: 1.5,
          position: "relative", // dla absolutnego pozycjonowania przypisów
        }}
      >
        {/* Logo */}
        <Box
          sx={{
            width: 100,
            height: 100,
            borderRadius: "50%",
            backgroundColor: "rgba(255,255,255,0.9)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            mb: 1,
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

        <Typography
          variant="h4"
          component="h1"
          sx={{
            color: "#ffffff",
            fontWeight: 700,
          }}
        >
          SplitBill
        </Typography>

        <Typography
          variant="h6"
          component="h2"
          sx={{
            color: "#ffffff",
            fontWeight: 500,
            mb: 1.5,
          }}
        >
          Logowanie
        </Typography>

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
            "& .MuiFormLabel-root": { color: "rgba(0,0,0,0.6)" },
          }}
        />

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
            "& .MuiFormLabel-root": { color: "rgba(0,0,0,0.6)" },
          }}
        />

        <Box
          sx={{
            width: "100%",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mt: -0.5,
            mb: 1,
          }}
        >
          <Link
            href="#"
            underline="none"
            sx={{ color: "#ff5555", fontSize: "0.875rem" }}
          >
            Nie pamiętam hasła
          </Link>
          <FormControlLabel
            control={
              <Checkbox
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                sx={{
                  color: "#ffffff",
                  "&.Mui-checked": { color: "#2ecc71" },
                }}
              />
            }
            label={
              <Typography sx={{ color: "#ffffff", fontSize: "0.875rem" }}>
                Zapamiętaj mnie
              </Typography>
            }
            sx={{ mr: 0 }}
          />
        </Box>

        {error && (
          <Typography
            sx={{
              color: "#ff6666",
              fontSize: "0.9rem",
              mb: 1,
              alignSelf: "flex-start",
            }}
          >
            {error}
          </Typography>
        )}

        <Button
          type="submit"
          variant="contained"
          sx={{
            mt: 0.5,
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
            position: "relative",
          }}
          fullWidth
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} sx={{ color: "#ffffff" }} /> : "Zaloguj się"}
        </Button>

        {/* Przypisy dolne (pozycjonowanie absolutne) */}
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
            * Zalogowanie się jest konieczne do utrzymania dostępu do aplikacji
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

export default SignInPage;
