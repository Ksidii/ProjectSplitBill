// src/pages/EventDetailsPage.jsx
import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Avatar,
  Stack,
  TextField,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Autocomplete,
  Chip,
} from "@mui/material";
import { useEvents } from "../context/EventContext";

const EventDetailsPage = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { events, addExpense } = useEvents();

  // 1) Hooki – muszą być zawsze na początku
  const [showAddForm, setShowAddForm] = useState(false);
  const [showReconciliation, setShowReconciliation] = useState(false);
  const [expName, setExpName] = useState("");
  const [expAmount, setExpAmount] = useState("");
  const [expPayer, setExpPayer] = useState(null); // obiekt {id, name}
  const [expBeneficiaries, setExpBeneficiaries] = useState([]); // tablica [{id, name}, ...]

  // 2) Znajdźmy wydarzenie w kontekście po eventId
  const event = events.find((e) => e.id === eventId);

  // 3) Jeśli nie znaleziono, pokaż 404
  if (!event) {
    return (
      <Box
        sx={{
          width: "100%",
          minHeight: "100vh",
          backgroundColor: "#121212",
          color: "#ffffff",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          p: 2,
        }}
      >
        <Paper
          sx={{
            p: 4,
            backgroundColor: "#1e1e1e",
            textAlign: "center",
          }}
        >
          <Typography variant="h5" sx={{ mb: 2 }}>
            Wydarzenie nie zostało znalezione
          </Typography>
          <Button variant="contained" onClick={() => navigate("/dashboard")}>
            Powrót do Dashboard
          </Button>
        </Paper>
      </Box>
    );
  }

  // 4) Przygotujmy tablicę uczestników w formacie {id, name}
  const participantsOptions = event.participants.map((p) => ({
    id: p.id,
    name: p.name,
  }));

  // 5) Funkcja dodająca wydatek, wywoływana z formularza
  const handleAddExpense = (e) => {
    e.preventDefault();

    // Walidacje
    if (!expName.trim()) {
      alert("Podaj nazwę wydatku.");
      return;
    }
    if (!expAmount || isNaN(Number(expAmount))) {
      alert("Podaj prawidłową kwotę (liczbę).");
      return;
    }
    if (!expPayer) {
      alert("Wybierz, kto zapłacił.");
      return;
    }
    if (expBeneficiaries.length === 0) {
      alert("Wybierz chociaż jedną osobę, która skorzystała.");
      return;
    }

    // Dodaj wydatek do kontekstu
    addExpense(eventId, {
      name: expName.trim(),
      amount: Number(expAmount),
      payer: expPayer,
      beneficiaries: expBeneficiaries,
    });

    // Wyczyść formularz i schowaj
    setExpName("");
    setExpAmount("");
    setExpPayer(null);
    setExpBeneficiaries([]);
    setShowAddForm(false);
  };

  // 6) Funkcja przechodząca do widoku rozliczenia
  const handleFinishAdding = () => {
    setShowAddForm(false);
    setShowReconciliation(true);
  };

  // 7) Jeśli mamy włączyć widok rozliczenia, obliczamy salda
  let reconciliationData = [];
  if (showReconciliation) {
    // Zainicjujmy obiekt do akumulacji
    const balances = {};
    // Ustaw początkowe wartości na 0
    event.participants.forEach((p) => {
      balances[p.name] = { paid: 0, owe: 0 };
    });

    // Przechodzimy przez wszystkie wydatki i aktualizujemy suma zapłacono / suma do spłaty
    event.expenses.forEach((exp) => {
      // exp.amount to kwota całkowita
      const share = exp.amount / exp.beneficiaries.length; // ile każdy powinien zapłacić
      // Dodaj do zapłaconych płacącego
      balances[exp.payerName].paid += exp.amount;
      // Każdy z beneficjentów dorzuca swoją część
      exp.beneficiaries.forEach((name) => {
        balances[name].owe += share;
      });
    });

    // Przygotujmy tablicę do wyświetlenia w tabeli
    reconciliationData = Object.entries(balances).map(([name, { paid, owe }]) => {
      const net = paid - owe; // dodatni → ma otrzymać, ujemny → ma zapłacić
      return {
        name,
        paid: paid.toFixed(2),
        owe: owe.toFixed(2),
        net: net.toFixed(2),
      };
    });
  }

  // ====================== RENDER główny ======================
  return (
    <Box
      sx={{
        width: "100%",
        minHeight: "100vh",
        backgroundColor: "#121212",
        color: "#ffffff",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Nagłówek wydarzenia */}
      <Box sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
          {event.name}
        </Typography>
        <Typography variant="subtitle1" sx={{ opacity: 0.7 }}>
          Data: {new Date(event.date).toLocaleDateString()}
        </Typography>
      </Box>

      {/* Główny kontener: Wydatki / Rozliczenie + Uczestnicy */}
      <Box
        sx={{
          display: "flex",
          gap: 4,
          flexDirection: { xs: "column", md: "row" },
          px: 4,
          pb: 4,
        }}
      >
        {/* ====== Lewa część: Wydatki lub Rozliczenie ====== */}
        <Paper
          sx={{
            flexGrow: 2,
            backgroundColor: "#1e1e1e",
            p: 2,
            borderRadius: 2,
          }}
        >
          <Typography variant="h6" sx={{ mb: 2 }}>
            Wydatki
          </Typography>

          {/* --- JEŚLI UŻYTKOWNIK JEST W TRYBIE ROZLICZENIA --- */}
          {showReconciliation && (
            <>
              <Typography variant="subtitle1" sx={{ mb: 2, color: "#2ecc71" }}>
                Podsumowanie rozliczenia
              </Typography>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ color: "#ffffff" }}>Uczestnik</TableCell>
                    <TableCell sx={{ color: "#ffffff" }}>Zapłacił (zł)</TableCell>
                    <TableCell sx={{ color: "#ffffff" }}>Powinien (zł)</TableCell>
                    <TableCell sx={{ color: "#ffffff" }}>Różnica (zł)</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {reconciliationData.map((row) => (
                    <TableRow key={row.name}>
                      <TableCell sx={{ color: "#ffffff" }}>{row.name}</TableCell>
                      <TableCell sx={{ color: "#ffffff" }}>{row.paid}</TableCell>
                      <TableCell sx={{ color: "#ffffff" }}>{row.owe}</TableCell>
                      <TableCell
                        sx={{
                          color: Number(row.net) < 0 ? "#ff6666" : "#2ecc71",
                        }}
                      >
                        {row.net}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <Box sx={{ textAlign: "center", mt: 3 }}>
                <Button
                  variant="contained"
                  onClick={() => {
                    // W przyszłości na przykład powrót do dashboardu
                    navigate("/dashboard");
                  }}
                  sx={{
                    textTransform: "none",
                    borderRadius: "25px",
                    bgcolor: "#3699ff",
                    "&:hover": { bgcolor: "#257bd0" },
                  }}
                >
                  Zakończ i wróć do Dashboard
                </Button>
              </Box>
            </>
          )}

          {/* --- JEŚLI UŻYTKOWNIK DODAJE WYDATKI (showReconciliation = false) --- */}
          {!showReconciliation && (
            <>
              {/* --- Brak wydatków i formularz schowany --- */}
              {event.expenses.length === 0 && !showAddForm && (
                <Box sx={{ textAlign: "center", py: 4 }}>
                  <Typography variant="body1" sx={{ opacity: 0.6 }}>
                    Brak wydatków
                  </Typography>
                  <Button
                    variant="contained"
                    color="success"
                    sx={{ mt: 2, mr: 2 }}
                    onClick={() => setShowAddForm(true)}
                  >
                    Dodaj wydatek
                  </Button>
                  <Button
                    variant="contained"
                    color="primary"
                    sx={{ mt: 2 }}
                    onClick={handleFinishAdding}
                  >
                    Zakończ dodawanie
                  </Button>
                </Box>
              )}

              {/* --- Są wydatki i formularz schowany --- */}
              {event.expenses.length > 0 && !showAddForm && (
                <>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ color: "#ffffff" }}>Nazwa</TableCell>
                        <TableCell sx={{ color: "#ffffff" }}>Kwota</TableCell>
                        <TableCell sx={{ color: "#ffffff" }}>Kto zapłacił</TableCell>
                        <TableCell sx={{ color: "#ffffff" }}>Kto skorzystał</TableCell>
                        <TableCell sx={{ color: "#ffffff" }}>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {event.expenses.map((exp) => (
                        <TableRow key={exp.id}>
                          <TableCell sx={{ color: "#ffffff" }}>{exp.name}</TableCell>
                          <TableCell sx={{ color: "#ffffff" }}>{exp.amount} zł</TableCell>
                          <TableCell sx={{ color: "#ffffff" }}>
                            {exp.payerName}
                          </TableCell>
                          <TableCell sx={{ color: "#ffffff" }}>
                            {exp.beneficiaries.join(", ")}
                          </TableCell>
                          <TableCell sx={{ color: "#ffffff" }}>{exp.status}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  <Box sx={{ textAlign: "center", mt: 2 }}>
                    <Button
                      variant="contained"
                      color="success"
                      onClick={() => setShowAddForm(true)}
                      sx={{ textTransform: "none", mr: 2 }}
                    >
                      Dodaj wydatek
                    </Button>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleFinishAdding}
                      sx={{ textTransform: "none" }}
                    >
                      Zakończ dodawanie
                    </Button>
                  </Box>
                </>
              )}

              {/* --- Formularz dodawania wydatku --- */}
              {showAddForm && (
                <Box component="form" onSubmit={handleAddExpense} sx={{ mt: 2 }}>
                  <Typography variant="h6" sx={{ mb: 2, color: "#2ecc71" }}>
                    Dodawanie wydatku
                  </Typography>

                  {/* Nazwa wydatku */}
                  <TextField
                    label="Nazwa wydatku"
                    variant="filled"
                    fullWidth
                    required
                    value={expName}
                    onChange={(e) => setExpName(e.target.value)}
                    sx={{
                      backgroundColor: "rgba(255,255,255,0.1)",
                      mb: 2,
                      "& .MuiFilledInput-root": { borderRadius: 1 },
                      input: { color: "#ffffff" },
                      "& .MuiFormLabel-root": { color: "rgba(255,255,255,0.7)" },
                    }}
                  />

                  {/* Kwota */}
                  <TextField
                    label="Kwota"
                    variant="filled"
                    fullWidth
                    required
                    type="number"
                    value={expAmount}
                    onChange={(e) => setExpAmount(e.target.value)}
                    sx={{
                      backgroundColor: "rgba(255,255,255,0.1)",
                      mb: 2,
                      "& .MuiFilledInput-root": { borderRadius: 1 },
                      input: { color: "#ffffff" },
                      "& .MuiFormLabel-root": { color: "rgba(255,255,255,0.7)" },
                    }}
                  />

                  {/* Kto zapłacił */}
                  <FormControl
                    variant="filled"
                    fullWidth
                    required
                    sx={{
                      backgroundColor: "rgba(255,255,255,0.1)",
                      mb: 2,
                      "& .MuiFilledInput-root": { borderRadius: 1 },
                    }}
                  >
                    <InputLabel sx={{ color: "rgba(255,255,255,0.7)" }}>
                      Kto zapłacił
                    </InputLabel>
                    <Select
                      value={expPayer ? expPayer.id : ""}
                      onChange={(e) => {
                        const payerObj = participantsOptions.find(
                          (p) => p.id === e.target.value
                        );
                        setExpPayer(payerObj);
                      }}
                      sx={{
                        color: "#ffffff",
                      }}
                    >
                      {participantsOptions.map((p) => (
                        <MenuItem key={p.id} value={p.id}>
                          {p.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  {/* Kto skorzystał */}
                  <Autocomplete
                    multiple
                    options={participantsOptions}
                    getOptionLabel={(option) => option.name}
                    value={expBeneficiaries}
                    onChange={(event, newValue) => {
                      setExpBeneficiaries(newValue);
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
                        label="Kto skorzystał"
                        placeholder="Wybierz osoby"
                        sx={{
                          backgroundColor: "rgba(255,255,255,0.1)",
                          mb: 2,
                          input: { color: "#ffffff" },
                          "& .MuiFormLabel-root": {
                            color: "rgba(255,255,255,0.7)",
                          },
                          "& .MuiFilledInput-root": { borderRadius: 1 },
                        }}
                      />
                    )}
                    sx={{
                      "& .MuiSvgIcon-root": { color: "#ffffff" },
                    }}
                  />

                  {/* Przycisk „Dodaj wydatek” */}
                  <Button
                    type="submit"
                    variant="contained"
                    color="success"
                    fullWidth
                    sx={{
                      textTransform: "none",
                      borderRadius: "25px",
                      py: 1.2,
                    }}
                  >
                    Dodaj wydatek
                  </Button>

                  {/* Przycisk „Anuluj” */}
                  <Button
                    variant="text"
                    fullWidth
                    sx={{
                      color: "#ffffff",
                      mt: 1,
                      textTransform: "none",
                    }}
                    onClick={() => setShowAddForm(false)}
                  >
                    Anuluj
                  </Button>
                </Box>
              )}
            </>
          )}
        </Paper>

        {/* ====== Prawa część: Lista uczestników ====== */}
        <Paper
          sx={{
            width: { xs: "100%", md: 240 },
            backgroundColor: "#1e1e1e",
            p: 2,
            borderRadius: 2,
            color: "#ffffff",
          }}
        >
          <Typography variant="h6" sx={{ mb: 2 }}>
            Uczestnicy
          </Typography>

          {event.participants.length === 0 ? (
            <Typography variant="body2" sx={{ opacity: 0.6 }}>
              Brak uczestników
            </Typography>
          ) : (
            <Stack spacing={2}>
              {event.participants.map((p) => (
                <Stack
                  key={p.id}
                  direction="row"
                  alignItems="center"
                  spacing={2}
                >
                  <Avatar sx={{ bgcolor: "#2ecc71" }}>
                    {p.name.charAt(0).toUpperCase()}
                  </Avatar>
                  <Typography>{p.name}</Typography>
                </Stack>
              ))}
            </Stack>
          )}

          <Button
            variant="contained"
            color="success"
            fullWidth
            sx={{
              mt: 3,
              textTransform: "none",
              borderRadius: "25px",
              py: 1.2,
            }}
            onClick={() => {
              alert("W przyszłości tutaj zaprosisz kolejnego uczestnika.");
            }}
          >
            Zaproś
          </Button>
        </Paper>
      </Box>
    </Box>
  );
};

export default EventDetailsPage;
