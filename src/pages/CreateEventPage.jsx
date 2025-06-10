// src/pages/CreateEventPage.jsx
import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Chip,
  Stack,
} from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";
import { useNavigate } from "react-router-dom";
import { useEvents } from "../context/EventContext";
import { useAuth } from "../context/AuthContext";

const CreateEventPage = () => {
  const navigate = useNavigate();
  const { createEvent } = useEvents();
  const { user } = useAuth();

  // Formularz: nazwa i data
  const [name, setName] = useState("");
  const [date, setDate] = useState(() => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  });

  // Uczestnicy: to będzie tablica obiektów typu { id, name }
  const [participants, setParticipants] = useState([]);

  // Przykładowa lista znajomych – w przyszłości zamień na pobranie z kontekstu/REST API
  const [friendsList, setFriendsList] = useState([]);

  useEffect(() => {
    // Załóżmy, że w przyszłości będziemy pobierać z API lub z innego kontekstu.
    // Tutaj dla demo używamy statycznej listy:
    const demoFriends = [
      { id: 1, name: "Damian Ch." },
      { id: 2, name: "Wiktoria S." },
      { id: 3, name: "Adrianna K." },
      { id: 4, name: "Adrian M." },
      { id: 5, name: "Sebastian S." },
      { id: 6, name: "Maja T." },
      // Możesz dodać więcej… lub później podmienić na realne dane z back-end
    ];
    setFriendsList(demoFriends);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!name.trim()) {
      alert("Proszę podać nazwę wydarzenia.");
      return;
    }

    // Tworzymy nowy event z wybranymi uczestnikami
    // Zakładamy, że createEvent akceptuje participants jako tablicę obiektów {id, name}
    const newId = createEvent({
      name: name.trim(),
      date,
      participants,
      // ew. dodaj inne pola, np. owner: user.id
    });

    // Przekierowanie na szczegóły eventu
    navigate(`/event/${newId}`);
  };

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        width: "100%",
      }}
    >
      <Paper
        component="form"
        onSubmit={handleSubmit}
        sx={{
          width: "100%",
          maxWidth: "480px",
          p: 4,
          backgroundColor: "#1e1e1e",
          borderRadius: 2,
        }}
      >
        <Typography
          variant="h5"
          component="h1"
          sx={{ mb: 3, color: "#ffffff" }}
        >
          Utwórz nowe wydarzenie
        </Typography>

        {/* Pole nazwy */}
        <TextField
          label="Nazwa wydarzenia"
          variant="filled"
          fullWidth
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          sx={{
            backgroundColor: "rgba(255,255,255,0.1)",
            mb: 3,
            "& .MuiFilledInput-root": { borderRadius: 1 },
            input: { color: "#ffffff" },
            "& .MuiFormLabel-root": { color: "rgba(255,255,255,0.7)" },
          }}
        />

        {/* Pole daty */}
        <TextField
          label="Data wydarzenia"
          type="date"
          variant="filled"
          fullWidth
          required
          value={date}
          onChange={(e) => setDate(e.target.value)}
          sx={{
            backgroundColor: "rgba(255,255,255,0.1)",
            mb: 3,
            "& .MuiFilledInput-root": { borderRadius: 1 },
            input: { color: "#ffffff" },
            "& .MuiFormLabel-root": { color: "rgba(255,255,255,0.7)" },
          }}
          InputLabelProps={{ shrink: true }}
        />

        {/* Autocomplete do wyboru uczestników */}
        <Autocomplete
          multiple
          options={friendsList}
          getOptionLabel={(option) => option.name}
          value={participants}
          onChange={(event, newValue) => {
            setParticipants(newValue);
          }}
          renderTags={(tagValue, getTagProps) =>
            tagValue.map((option, index) => (
              <Chip
                label={option.name}
                {...getTagProps({ index })}
                key={option.id}
                sx={{ bgcolor: "#2ecc71", color: "#ffffff" }}
              />
            ))
          }
          renderInput={(params) => (
            <TextField
              {...params}
              variant="filled"
              label="Wybierz uczestników"
              placeholder="Znajomi"
              sx={{
                backgroundColor: "rgba(255,255,255,0.1)",
                mb: 3,
                input: { color: "#ffffff" },
                "& .MuiFormLabel-root": { color: "rgba(255,255,255,0.7)" },
                "& .MuiFilledInput-root": { borderRadius: 1 },
              }}
            />
          )}
          sx={{
            mb: 3,
            "& .MuiAutocomplete-popupIndicator": { color: "#ffffff" },
            "& .MuiAutocomplete-clearIndicator": { color: "#ffffff" },
            "& .MuiSvgIcon-root": { color: "#ffffff" },
          }}
        />

        {/* Wyświetlamy zaznaczonych uczestników jako chipy (opcjonalnie) */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" sx={{ mb: 1, color: "#ffffff" }}>
            Wybrani uczestnicy:
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap">
            {participants.length === 0 ? (
              <Typography
                variant="body2"
                sx={{ opacity: 0.6, color: "#ffffff" }}
              >
                Brak wybranych osób
              </Typography>
            ) : (
              participants.map((p) => (
                <Chip
                  key={p.id}
                  label={p.name}
                  onDelete={() =>
                    setParticipants((prev) =>
                      prev.filter((pp) => pp.id !== p.id)
                    )
                  }
                  sx={{ mb: 1, bgcolor: "#2ecc71", color: "#ffffff" }}
                />
              ))
            )}
          </Stack>
        </Box>

        {/* Przycisk utworzenia wydarzenia */}
        <Button
          type="submit"
          variant="contained"
          color="success"
          fullWidth
          sx={{
            textTransform: "none",
            borderRadius: "25px",
            py: 1.5,
          }}
        >
          Utwórz wydarzenie
        </Button>
      </Paper>
    </Box>
  );
};

export default CreateEventPage;
