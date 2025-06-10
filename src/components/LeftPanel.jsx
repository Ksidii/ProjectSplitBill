// src/components/LeftPanel.jsx
import React from "react";
import { Box, Typography } from "@mui/material";

const LeftPanel = () => {
  return (
    <Box
      sx={{
        position: "relative",
        width: "100%",
        height: "100%",
        backgroundImage: "url('/images/background.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        color: "#ffffff",
        textAlign: "center",
      }}
    >
      {/* Białe kółko z logo */}
      <Box
        sx={{
          width: 120,
          height: 120,
          borderRadius: "50%",
          backgroundColor: "rgba(255,255,255,0.9)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          mb: 2,
        }}
      >
        <Box
          component="img"
          src="/images/logo.png"
          alt="Logo SplitBill"
          sx={{
            width: 64,
            height: 64,
          }}
        />
      </Box>

      {/* Tekst „SplitBill” */}
      <Typography
        variant="h3"
        component="h1"
        sx={{
          fontWeight: 700,
          letterSpacing: 1,
        }}
      >
        SplitBill
      </Typography>

      {/* Przypisy dolne – na samym dole panelu */}
      <Box
        sx={{
          position: "absolute",
          bottom: 16,
          left: 16,
          right: 16,
        }}
      >
        <Typography
          variant="caption"
          component="p"
          sx={{ opacity: 0.8, mb: 0.5 }}
        >
          * Utworzenie konta jest konieczne do utrzymania dostępu do aplikacji
        </Typography>
        <Typography variant="caption" component="p" sx={{ opacity: 0.6 }}>
          * Background designed by jcomp / Freepik
        </Typography>
      </Box>
    </Box>
  );
};

export default LeftPanel;
