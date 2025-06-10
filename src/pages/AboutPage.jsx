// src/pages/AboutPage.jsx
import React from "react";
import { Box, Typography, Avatar, Grid, Container } from "@mui/material";

const teamMembers = [
  { id: 1, name: "Damian Chymkowski", avatar: "/images/team/damian.jpg" },
  { id: 2, name: "Maja Taranowska", avatar: "/images/team/maja.jpg" },
  { id: 3, name: "Wiktoria Sytniewska", avatar: "/images/team/wiktoria.jpg" },
  { id: 4, name: "Sebastian Szwajnoch", avatar: "/images/team/sebastian.jpg" },
  { id: 5, name: "Adrianna Konarska", avatar: "/images/team/adrianna.jpg" },
  { id: 6, name: "Adrian Muniak", avatar: "/images/team/adrian.jpg" },
];

const AboutPage = () => {
  return (
    <Box
      sx={{
        width: "100%",
        minHeight: "100vh",
        // Pełnoekranowe tło, skalowane proporcjonalnie:
        backgroundImage:
          "linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url('/images/background.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        color: "#ffffff",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* 1) Górna część: Kontener wyśrodkowany o maxWidth=md */}
      <Container
        maxWidth="md"
        sx={{
          pt: { xs: 8, sm: 10, md: 12 }, // odstęp od góry
          textAlign: "center",
        }}
      >
        <Typography
          variant="h3"
          component="h1"
          sx={{
            fontWeight: 700,
            mb: { xs: 2, sm: 3 },
          }}
        >
          SplitBill
        </Typography>

        <Box sx={{ mb: { xs: 4, sm: 6 } }}>
          <Typography
            variant="body1"
            sx={{
              lineHeight: 1.6,
              textAlign: "center",
              px: { xs: 2, sm: 0 }, // dodatkowy padding na bardzo wąskich ekranach
            }}
          >
            Lorem Ipsum is simply dummy text of the printing and typesetting
            industry. Lorem Ipsum has been the industry's standard dummy text
            ever since the 1500s, when an unknown printer took a galley of type
            and scrambled it to make a type specimen book. It has survived not
            only five centuries, but also the leap into electronic typesetting,
            remaining essentially unchanged. It was popularised in the 1960s
            with the release of Letraset sheets containing Lorem Ipsum passages,
            and more recently with desktop publishing software like Aldus
            PageMaker including versions of Lorem Ipsum.
          </Typography>
        </Box>
      </Container>

      {/* 2) Sekcja avatarów: Grid wyśrodkowany i responsywny */}
      <Container maxWidth="lg" sx={{ flexGrow: 1, mb: { xs: 6, md: 8 } }}>
        <Grid container spacing={4} justifyContent="center">
          {teamMembers.map((member) => (
            <Grid
              item
              key={member.id}
              xs={6}      // 2 kolumny na ekranach <600px
              sm={4}      // 3 kolumny na ekranach ≥600px
              md={2}      // 6 kolumn na ekranach ≥900px
              sx={{ textAlign: "center" }}
            >
              <Avatar
                src={member.avatar}
                alt={member.name}
                sx={{
                  width: { xs: 80, sm: 100, md: 120 },
                  height: { xs: 80, sm: 100, md: 120 },
                  margin: "0 auto",
                  mb: 1,
                  border: "2px solid #2ecc71",
                }}
              />
              <Typography
                variant="subtitle1"
                sx={{
                  fontWeight: 600,
                  fontSize: { xs: "0.9rem", sm: "1rem" },
                }}
              >
                {member.name}
              </Typography>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default AboutPage;
