// src/pages/Dashboard.jsx
import React from "react";
import {
  Box,
  Typography,
  Button,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Paper,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Divider,
  ButtonBase,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useEvents } from "../context/EventContext";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { events } = useEvents();

  const userName = user?.username || "Użytkowniku";

  // Dzisiaj bez godziny (porównanie wyłącznie dat)
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Filtrujemy wydarzenia: trwające (data >= dziś) i zakończone (data < dziś)
  const ongoingEvents = events.filter((e) => {
    const eventDate = new Date(e.date);
    eventDate.setHours(0, 0, 0, 0);
    return eventDate >= today;
  });
  const completedEvents = events.filter((e) => {
    const eventDate = new Date(e.date);
    eventDate.setHours(0, 0, 0, 0);
    return eventDate < today;
  });

  // Przykładowa lista znajomych (na razie statyczna)
  const friends = [
    { id: 1, name: "Damian Ch.", avatar: "/images/friend1.jpg" },
    { id: 2, name: "Wiktoria S.", avatar: "/images/friend2.jpg" },
    { id: 3, name: "Adrianna K.", avatar: "/images/friend3.jpg" },
    { id: 4, name: "Adrian M.", avatar: "/images/friend4.jpg" },
    { id: 5, name: "Sebastian S.", avatar: "/images/friend5.jpg" },
    { id: 6, name: "Maja T.", avatar: "/images/friend6.jpg" },
  ];

  // Jeżeli nie ma jeszcze żadnych wydarzeń, pokaż „ekran powitalny” z dużymi kartami
  if (events.length === 0) {
    return (
      <Box sx={{ width: "100%" }}>
        {/* Powitanie tuż pod headerem */}
        <Box sx={{ textAlign: "center", mb: 4 }}>
          <Typography
            variant="h4"
            component="h1"
            sx={{ fontWeight: 700, color: "#ffffff" }}
          >
            {userName}, witaj na SplitBill!
          </Typography>
          <Typography variant="subtitle1" sx={{ mt: 1, color: "rgba(255,255,255,0.7)" }}>
            Nie masz jeszcze żadnych wydarzeń.
          </Typography>
        </Box>

        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            gap: 4,
            justifyContent: "center",
            alignItems: "flex-start",
          }}
        >
          {/* Karta 1: Dołącz do istniejącego wydarzenia */}
          <Card
            sx={{
              backgroundColor: "#1e1e1e",
              color: "#ffffff",
              maxWidth: 345,
              flexGrow: 1,
              borderRadius: 2,
              boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
            }}
          >
            <CardMedia
              component="img"
              height="200"
              image="/images/join_event.jpg"
              alt="Dołącz do istniejącego wydarzenia"
            />
            <CardContent>
              <Typography variant="h6" component="h2" sx={{ fontWeight: 600, mb: 1 }}>
                Dołącz do istniejącego wydarzenia
              </Typography>
            </CardContent>
            <CardActions sx={{ justifyContent: "center", mb: 1 }}>
              <Button
                variant="contained"
                color="success"
                onClick={() =>
                  alert("W przyszłości otworzysz widok dołączania do istniejącego wydarzenia.")
                }
                sx={{ textTransform: "none", borderRadius: "25px", px: 4 }}
              >
                Dołącz do wydarzenia
              </Button>
            </CardActions>
            <Box sx={{ textAlign: "center", mb: 2 }}>
              <Typography variant="caption" component="p" sx={{ opacity: 0.6, color: "#cccccc" }}>
                *Background designed by rawpixel.com / Freepik
              </Typography>
            </Box>
          </Card>

          {/* Karta 2: Stwórz swoje wydarzenie */}
          <Card
            sx={{
              backgroundColor: "#1e1e1e",
              color: "#ffffff",
              maxWidth: 345,
              flexGrow: 1,
              borderRadius: 2,
              boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
            }}
          >
            <CardMedia
              component="img"
              height="200"
              image="/images/create_event.jpg"
              alt="Stwórz swoje wydarzenie"
            />
            <CardContent>
              <Typography variant="h6" component="h2" sx={{ fontWeight: 600, mb: 1 }}>
                Stwórz swoje wydarzenie
              </Typography>
            </CardContent>
            <CardActions sx={{ justifyContent: "center", mb: 1 }}>
              <Button
                variant="contained"
                color="success"
                onClick={() => navigate("/create-event")}
                sx={{ textTransform: "none", borderRadius: "25px", px: 4 }}
              >
                Utwórz wydarzenie
              </Button>
            </CardActions>
            <Box sx={{ textAlign: "center", mb: 2 }}>
              <Typography variant="caption" component="p" sx={{ opacity: 0.6, color: "#cccccc" }}>
                *Background designed by Freepik
              </Typography>
            </Box>
          </Card>
        </Box>
      </Box>
    );
  }

  // Jeżeli są już wydarzenia, pokaż standardowy widok z listami „trwające” i „zakończone”
  return (
    <Box sx={{ width: "100%" }}>
      {/* Powitanie */}
      <Box sx={{ textAlign: "center", mb: 4 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 700, color: "#ffffff" }}>
          Witaj na SplitBill!
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", mt: 1 }}>
          <Avatar sx={{ bgcolor: "#2ecc71", mr: 1 }}>
            {userName.charAt(0).toUpperCase()}
          </Avatar>
          <Typography variant="h6" sx={{ color: "#ffffff" }}>
            Hej, {userName}!
          </Typography>
        </Box>
      </Box>

      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          gap: 4,
          justifyContent: "center",
          alignItems: "flex-start",
        }}
      >
        {/* Panel główny z dwoma kolumnami */}
        <Paper
          sx={{
            flexGrow: 2,
            backgroundColor: "#1e1e1e",
            borderRadius: 2,
            p: 3,
            maxWidth: 800,
            color: "#ffffff",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Nagłówki kolumn */}
          <Box
            sx={{
              display: "flex",
              bgcolor: "#2a2a2a",
              borderRadius: 1,
              overflow: "hidden",
              mb: 2,
            }}
          >
            <Box sx={{ flex: 1, p: 1.5, textAlign: "center" }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                Trwające wydarzenia
              </Typography>
            </Box>
            <Box sx={{ flex: 1, p: 1.5, textAlign: "center", borderLeft: "1px solid #121212" }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                Zakończone wydarzenia
              </Typography>
            </Box>
          </Box>

          {/* Lista wydarzeń */}
          <Box sx={{ display: "flex", flexGrow: 1 }}>
            {/* Trwające */}
            <Box sx={{ flex: 1, pr: 1 }}>
              {ongoingEvents.length === 0 ? (
                <Typography sx={{ color: "rgba(255,255,255,0.6)", textAlign: "center", mt: 4 }}>
                  Brak trwających wydarzeń
                </Typography>
              ) : (
                ongoingEvents.map((evt) => (
                  <ButtonBase
                    key={evt.id}
                    onClick={() => navigate(`/event/${evt.id}`)}
                    sx={{
                      display: "block",
                      width: "100%",
                      textAlign: "left",
                      py: 1,
                      borderBottom: "1px solid #2a2a2a",
                    }}
                  >
                    <Typography sx={{ fontWeight: 500, color: "#ffffff" }}>{evt.name}</Typography>
                    <Typography sx={{ fontSize: "0.875rem", color: "rgba(255,255,255,0.7)" }}>
                      {new Date(evt.date).toLocaleDateString()}
                    </Typography>
                  </ButtonBase>
                ))
              )}
            </Box>

            {/* Zakończone */}
            <Box sx={{ flex: 1, pl: 1, borderLeft: "1px solid #2a2a2a" }}>
              {completedEvents.length === 0 ? (
                <Typography sx={{ color: "rgba(255,255,255,0.6)", textAlign: "center", mt: 4 }}>
                  Brak zakończonych wydarzeń
                </Typography>
              ) : (
                completedEvents.map((evt) => (
                  <ButtonBase
                    key={evt.id}
                    onClick={() => navigate(`/event/${evt.id}`)}
                    sx={{
                      display: "block",
                      width: "100%",
                      textAlign: "left",
                      py: 1,
                      borderBottom: "1px solid #2a2a2a",
                    }}
                  >
                    <Typography sx={{ fontWeight: 500, color: "#ffffff" }}>{evt.name}</Typography>
                    <Typography sx={{ fontSize: "0.875rem", color: "rgba(255,255,255,0.7)" }}>
                      {new Date(evt.date).toLocaleDateString()}
                    </Typography>
                  </ButtonBase>
                ))
              )}
            </Box>
          </Box>

          {/* Przycisk na dole */}
          <Box sx={{ display: "flex", justifyContent: "space-between", mt: 3 }}>
            <Button
              variant="contained"
              color="success"
              onClick={() => alert("W przyszłości otworzysz dołączenie do eventu")}
              sx={{ textTransform: "none", borderRadius: "25px", px: 4 }}
            >
              Dołącz do wydarzenia
            </Button>
            <Button
              variant="contained"
              color="success"
              onClick={() => navigate("/create-event")}
              sx={{ textTransform: "none", borderRadius: "25px", px: 4 }}
            >
              Utwórz wydarzenie
            </Button>
          </Box>
        </Paper>

        {/* Pasek z listą znajomych */}
        <Paper
          sx={{
            width: 240,
            backgroundColor: "#1e1e1e",
            borderRadius: 2,
            p: 2,
            color: "#ffffff",
            flexShrink: 0,
          }}
        >
          <Typography variant="h6" sx={{ mb: 2 }}>
            Znajomi
          </Typography>
          <List sx={{ maxHeight: 400, overflowY: "auto", p: 0 }}>
            {friends.map((f) => (
              <ListItem key={f.id} sx={{ py: 1, px: 0 }}>
                <ListItemAvatar>
                  <Avatar src={f.avatar} alt={f.name} />
                </ListItemAvatar>
                <ListItemText primary={f.name} primaryTypographyProps={{ color: "#ffffff" }} />
              </ListItem>
            ))}
          </List>
          <Divider sx={{ my: 1, borderColor: "#2a2a2a" }} />
          <Button
            variant="contained"
            color="success"
            fullWidth
            onClick={() => alert("W przyszłości otworzysz modal dodawania znajomego")}
            sx={{ textTransform: "none", borderRadius: "25px", mt: 1 }}
          >
            Dodaj znajomego
          </Button>
        </Paper>
      </Box>
    </Box>
  );
};

export default Dashboard;
