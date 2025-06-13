
import React, { useState, useEffect } from "react";
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
  ListItemText,
  Avatar,
  Divider,
  ButtonBase,
  TextField,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useEvents } from "../context/EventContext";
import LoadingScreen from "../components/LoadingScreen";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { events, friends, addFriend, reloadFriends, eventsLoaded } = useEvents();

  const [newFriendEmail, setNewFriendEmail] = useState("");
  const [adding, setAdding] = useState(false);
const [loading, setLoading] = useState(true);

useEffect(() => {
  if (events.length) {
    setLoading(false);  
  }
}, [events]);

if (!eventsLoaded) return <LoadingScreen />;


  const handleAddFriend = async () => {
    const email = newFriendEmail.trim().toLowerCase();
    if (!email) return;

    setAdding(true);
    try {

      await addFriend(email);
      setNewFriendEmail("");
    } catch (err) {
      console.error("Błąd dodawania znajomego:", err);
      alert(err.message || "Nie udało się dodać znajomego.");
    } finally {
      setAdding(false);
    }
  };



 
  const userName = user?.displayName || user?.email || "Użytkowniku";

  
  const today = new Date();
  today.setHours(0, 0, 0, 0);


  const ongoingEvents = events.filter((e) => {
    const d = new Date(e.date);
    d.setHours(0, 0, 0, 0);
    return d >= today;
  });
  const completedEvents = events.filter((e) => {
    const d = new Date(e.date);
    d.setHours(0, 0, 0, 0);
    return d < today;
  });


  if (events.length === 0) {
    return (
      <Box sx={{ width: "100%" }}>
        <Box sx={{ textAlign: "center", mb: 4 }}>
          <Typography
            variant="h4"
            component="h1"
            sx={{ fontWeight: 700, color: "#ffffff" }}
          >
            {userName}, witaj na SplitBill!
          </Typography>
          <Typography
            variant="subtitle1"
            sx={{ mt: 1, color: "rgba(255,255,255,0.7)" }}
          >
            Nie masz jeszcze żadnych wydarzeń.
          </Typography>
        </Box>

        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            gap: 4,
            justifyContent: "center",
            alignItems: "stretch",
          }}
        >
          <Card
            sx={{
              backgroundColor: "#1e1e1e",
              color: "#ffffff",
              maxWidth: 345,
              flexGrow: 1,
              display: "flex",
              flexDirection: "column",
              height: "100%",
              borderRadius: 2,
              boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
            }}
          >
            <CardMedia
              component="img"
              height="200"
              image="/images/join_event.png"
              alt="Dołącz do istniejącego wydarzenia"
            />
            <CardContent sx={{ flexGrow: 1 }}>
              <Typography variant="h6" component="h2" sx={{ fontWeight: 600, mb: 1 }}>
                Dołącz do istniejącego wydarzenia
              </Typography>
            </CardContent>
            <CardActions sx={{ justifyContent: "center" }}>
              <Button
                variant="contained"
                color="success"
                onClick={() =>
                  alert(
                    "W przyszłości otworzysz widok dołączania do istniejącego wydarzenia."
                  )
                }
                sx={{ textTransform: "none", borderRadius: "25px", px: 4 }}
              >
                Dołącz do wydarzenia
              </Button>
            </CardActions>
            <Box sx={{ mt: "auto", textAlign: "center", pb: 2 }}>
              <Typography variant="caption" sx={{ opacity: 0.6, color: "#cccccc" }}>
                *Background designed by rawpixel.com / Freepik
              </Typography>
            </Box>
          </Card>

          <Card
            sx={{
              backgroundColor: "#1e1e1e",
              color: "#ffffff",
              maxWidth: 345,
              flexGrow: 1,
              display: "flex",
              flexDirection: "column",
              height: "100%",
              borderRadius: 2,
              boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
            }}
          >
            <CardMedia
              component="img"
              height="200"
              image="/images/create_event.png"
              alt="Stwórz swoje wydarzenie"
            />
            <CardContent sx={{ flexGrow: 1 }}>
              <Typography variant="h6" component="h2" sx={{ fontWeight: 600, mb: 1 }}>
                Stwórz swoje wydarzenie
              </Typography>
            </CardContent>
            <CardActions sx={{ justifyContent: "center" }}>
              <Button
                variant="contained"
                color="success"
                onClick={() => navigate("/create-event")}
                sx={{ textTransform: "none", borderRadius: "25px", px: 4 }}
              >
                Utwórz wydarzenie
              </Button>
            </CardActions>
            <Box sx={{ mt: "auto", textAlign: "center", pb: 2 }}>
              <Typography variant="caption" sx={{ opacity: 0.6, color: "#cccccc" }}>
                *Background designed by Freepik
              </Typography>
            </Box>
          </Card>
        </Box>
      </Box>
    );
  }


  return (
    <Box sx={{ width: "100%" }}>
      {/* Powitanie */}
      <Box sx={{ textAlign: "center", mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: "#ffffff" }}>
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
        {/* Panel wydarzeń */}
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
          {/* Nagłówki */}
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
            <Box
              sx={{
                flex: 1,
                p: 1.5,
                textAlign: "center",
                borderLeft: "1px solid #121212",
              }}
            >
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                Zakończone wydarzenia
              </Typography>
            </Box>
          </Box>

          {/* Listy */}
          <Box sx={{ display: "flex", flexGrow: 1 }}>
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
                    <Typography sx={{ fontWeight: 500, color: "#ffffff" }}>
                      {evt.name}
                    </Typography>
                    <Typography sx={{ fontSize: "0.875rem", color: "rgba(255,255,255,0.7)" }}>
                      {new Date(evt.date).toLocaleDateString()}
                    </Typography>
                  </ButtonBase>
                ))
              )}
            </Box>

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
                    <Typography sx={{ fontWeight: 500, color: "#ffffff" }}>
                      {evt.name}
                    </Typography>
                    <Typography sx={{ fontSize: "0.875rem", color: "rgba(255,255,255,0.7)" }}>
                      {new Date(evt.date).toLocaleDateString()}
                    </Typography>
                  </ButtonBase>
                ))
              )}
            </Box>
          </Box>

          {/* Akcje */}
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

        {/* Pasek znajomych */}
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
          <Typography variant="h6" sx={{ mb: 1 }}>
            Znajomi
          </Typography>
          <List sx={{ maxHeight: 200, overflowY: "auto", p: 0 }}>
            {friends.length === 0 ? (
              <Typography sx={{ color: "rgba(255,255,255,0.6)", textAlign: "center", py: 2 }}>
                Brak znajomych
              </Typography>
            ) : (
              friends.map((f) => (
                <ListItem key={f.uid} sx={{ py: 1, px: 0 }}>
                  <Avatar sx={{ bgcolor: "#2ecc71", mr: 1 }}>
                    {f.email.charAt(0).toUpperCase()}
                  </Avatar>
                  <ListItemText
                    primary={f.email}
                    secondary={f.name}
                    primaryTypographyProps={{ color: "#ffffff", fontSize: "0.875rem" }}
                    secondaryTypographyProps={{ color: "rgba(255,255,255,0.7)", fontSize: "0.75rem" }}
                  />
                </ListItem>
              ))
            )}
          </List>

          <Divider sx={{ borderColor: "#2a2a2a", my: 2 }} />

          <TextField
            label="Email znajomego"
            variant="outlined"
            size="small"
            fullWidth
            value={newFriendEmail}
            onChange={(e) => setNewFriendEmail(e.target.value)}
            sx={{
              mb: 1,
              "& .MuiOutlinedInput-notchedOutline": { borderColor: "#555" },
              "& .MuiInputBase-input": { color: "#fff" },
              "& .MuiInputLabel-root": { color: "rgba(255,255,255,0.7)" },
            }}
          />
          <Button
            variant="contained"
            size="small"
            fullWidth
            disabled={adding}
            onClick={handleAddFriend}
            sx={{ textTransform: "none", borderRadius: "25px" }}
          >
            Dodaj znajomego
          </Button>
        </Paper>
      </Box>
    </Box>
  );
};

export default Dashboard;
