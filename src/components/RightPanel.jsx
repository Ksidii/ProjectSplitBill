// src/components/RightPanel.jsx
import React from "react";
import { Box, Typography, Button } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";

const RightPanel = () => {
  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",            
        backgroundColor: "#159976", 
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: 2,
      }}
    >
      <Box
        sx={{
          textAlign: "center",
          color: "white",
          width: "100%",
          maxWidth: "320px",
        }}
      >
        {/* Nagłówek */}
        <Typography
          variant="h5"
          component="h2"
          sx={{ fontWeight: 600, mb: 3 }}
        >
          Dołącz do naszej społeczności!
        </Typography>

        {/* Przycisk “UTWÓRZ KONTO” → prowadzi do /register */}
        <Button
          component={RouterLink}
          to="/register"
          variant="contained"
          sx={{
            bgcolor: "#00ffbb",
            color: "#1a1a1a",
            borderRadius: "25px",
            width: "100%",
            py: 1.5,
            mb: 2,
            textDecoration: "none",

          }}
        >
          UTWÓRZ KONTO
        </Button>

        {/* Tekst rozdzielający */}
        <Typography variant="body2" sx={{ mb: 1, opacity: 0.9 }}>
          ...lub zaloguj się do konta
        </Typography>

        {/* Przycisk “ZALOGUJ SIĘ” → prowadzi do /signin */}
        <Button
          component={RouterLink}
          to="/signin"
          variant="contained"
          sx={{
            bgcolor: "#00ffbb",
            color: "black",
            borderRadius: "25px",
            width: "100%",
            py: 1.5,
            textDecoration: "none",

          }}
        >
          ZALOGUJ SIĘ
        </Button>
      </Box>
    </Box>
  );
};

export default RightPanel;
