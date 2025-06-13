
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
  const { isAuthenticated, login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail]           = useState("");
  const [password, setPassword]     = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError]           = useState("");
  const [loading, setLoading]       = useState(false);

  useEffect(() => {
    if (isAuthenticated) navigate("/dashboard");
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err) {
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
          "linear-gradient(rgba(0,100,80,0.4), rgba(0,100,80,0.4)), url('/images/background.png')",
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
          maxWidth: 360,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 1.5,
          p: 3,
          bgcolor: "rgba(255,255,255,0.9)",
          borderRadius: 2,
        }}
      >
        <Box
          sx={{
            width: 100,
            height: 100,
            borderRadius: "50%",
            bgcolor: "#fff",
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
            sx={{ width: 56, height: 56 }}
          />
        </Box>

        <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
          SplitBill
        </Typography>
        <Typography variant="h6" component="h2" sx={{ fontWeight: 500, mb: 1.5 }}>
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
            "& .MuiFilledInput-root": { borderRadius: 2 },
            input: { padding: "12px" },
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
            "& .MuiFilledInput-root": { borderRadius: 2 },
            input: { padding: "12px" },
          }}
        />

        <Box sx={{ width: "100%", display: "flex", justifyContent: "space-between", mb: 1 }}>
          <Link href="#" underline="none" sx={{ color: "error.main", fontSize: 14 }}>
            Nie pamiętam hasła
          </Link>
          <FormControlLabel
            control={
              <Checkbox
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                sx={{ color: "success.main" }}
              />
            }
            label={<Typography sx={{ fontSize: 14 }}>Zapamiętaj mnie</Typography>}
          />
        </Box>

        {error && (
          <Typography color="error" sx={{ fontSize: 14, mb: 1, alignSelf: "flex-start" }}>
            {error}
          </Typography>
        )}

        <Button
          type="submit"
          variant="contained"
          fullWidth
          disabled={loading}
          sx={{
            bgcolor: "success.main",
            color: "#fff",
            textTransform: "none",
            fontWeight: 600,
            borderRadius: 2,
            py: 1.5,
            "&:hover": { bgcolor: "success.dark" },
          }}
        >
          {loading ? <CircularProgress size={24} sx={{ color: "#fff" }} /> : "Zaloguj się"}
        </Button>

        <Typography variant="caption" align="center" sx={{ opacity: 0.8 }}>
          * Logowanie lub rejestracja jest konieczne do utrzymania dostępu do aplikacji
        </Typography>
        <Typography variant="caption" align="center" sx={{ opacity: 0.6 }}>
          * Background designed by jcomp / Freepik
        </Typography>
      </Box>
    </Box>
  );
};

export default SignInPage;
