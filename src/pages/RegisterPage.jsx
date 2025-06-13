
import React, { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  CircularProgress,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth } from "../firebase";

const RegisterPage = () => {
  const [email, setEmail]             = useState("");
  const [password, setPassword]       = useState("");
  const [confirmPassword, setConfirm] = useState("");
  const [name, setName] = useState("");
  const [error, setError]             = useState("");
  const [loading, setLoading]         = useState(false);
  const navigate                      = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

        if (!name.trim()) {
      setError("Podaj imię i nazwisko.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Hasła nie są zgodne");
      return;
    }
    setLoading(true);

    try {

      const userCredential = await createUserWithEmailAndPassword(auth, email, password);


await updateProfile(userCredential.user, {
  displayName: name.trim(),
});

      navigate("/dashboard");
    } catch (err) {
      console.error("Rejestracja error:", err);
      switch (err.code) {
        case "auth/email-already-in-use":
          setError("Ten e-mail jest już używany.");
          break;
        case "auth/invalid-email":
          setError("Nieprawidłowy format adresu e-mail.");
          break;
        case "auth/weak-password":
          setError("Hasło jest za słabe (min. 6 znaków).");
          break;
        default:
          setError("Coś poszło nie tak, spróbuj ponownie.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        width: "100vw", height: "100vh",
        backgroundImage:
          "linear-gradient(rgba(0,100,80,0.4),rgba(0,100,80,0.4)), url('/images/background.png')",
        backgroundSize: "cover", backgroundPosition: "center",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}
    >
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          width: "100%", maxWidth: 360,
          display: "flex", flexDirection: "column",
          alignItems: "center", gap: 2, position: "relative",
        }}
      >
        {/* Logo */}
        <Box
          sx={{
            width: 100, height: 100, borderRadius: "50%",
            backgroundColor: "rgba(255,255,255,0.9)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          <Box
            component="img"
            src="/images/logo.png"
            alt="Logo SplitBill"
            sx={{ width: 56, height: 56 }}
          />
        </Box>

        <Typography variant="h4" component="h1" sx={{ color: "#fff", fontWeight: 700 }}>
          SplitBill
        </Typography>
        <Typography variant="h6" component="h2" sx={{ color: "#fff", fontWeight: 500 }}>
          Zarejestruj się
        </Typography>
        <TextField
  label="Imię i nazwisko"
  variant="filled"
  value={name}
  onChange={(e) => setName(e.target.value)}
  required
  fullWidth
  sx={{
    backgroundColor: "rgba(255,255,255,0.9)", borderRadius: 2,
    "& .MuiFilledInput-root": { borderRadius: 2 },
    input: { padding: "12px" },
  }}
/>
  
        <TextField
          label="E-mail" type="email" variant="filled"
          value={email} onChange={e => setEmail(e.target.value)}
          required fullWidth
          sx={{
            backgroundColor: "rgba(255,255,255,0.9)", borderRadius: 2,
            "& .MuiFilledInput-root": { borderRadius: 2 },
            input: { padding: "12px" },
          }}
        />

        <TextField
          label="Hasło" type="password" variant="filled"
          value={password} onChange={e => setPassword(e.target.value)}
          required fullWidth
          sx={{
            backgroundColor: "rgba(255,255,255,0.9)", borderRadius: 2,
            "& .MuiFilledInput-root": { borderRadius: 2 },
            input: { padding: "12px" },
          }}
        />

        <TextField
          label="Potwierdź hasło" type="password" variant="filled"
          value={confirmPassword} onChange={e => setConfirm(e.target.value)}
          required fullWidth
          sx={{
            backgroundColor: "rgba(255,255,255,0.9)", borderRadius: 2,
            "& .MuiFilledInput-root": { borderRadius: 2 },
            input: { padding: "12px" },
          }}
        />

        {error && (
          <Typography sx={{ color: "#ff6666", fontSize: "0.9rem", alignSelf: "flex-start" }}>
            {error}
          </Typography>
        )}

        <Button
          type="submit"
          variant="contained"
          fullWidth
          disabled={loading}
          sx={{
            mt: 1, mb: 2,
            backgroundColor: "#2ecc71", color: "#fff",
            textTransform: "none", fontWeight: 600,
            borderRadius: "25px", px: 4, py: 1.5,
            "&:hover": { backgroundColor: "#27ae60" },
          }}
        >
          {loading ? <CircularProgress size={24} sx={{ color: "#fff" }} /> : "Utwórz konto"}
        </Button>

        {/* Podpisy dolne */}
        <Box
          sx={{
            position: "absolute", bottom: 16, left: 16, right: 16,
            textAlign: "center",
          }}
        >
          <Typography variant="caption" sx={{ color: "#fff", opacity: 0.8, mb: 0.5 }}>
            * Utworzenie konta jest konieczne do utrzymania dostępu do aplikacji
          </Typography>
          <Typography variant="caption" sx={{ color: "#fff", opacity: 0.6 }}>
            * Background designed by jcomp / Freepik
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default RegisterPage;
