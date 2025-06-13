
import React, { useState, useEffect } from "react";
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
import { useAuth } from "../context/AuthContext";
import CircularProgress from "@mui/material/CircularProgress";

const EventDetailsPage = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const {
    events,
    friends,
    addParticipant,
    addExpense,
    loadEventDetails,
    markExpensePaid,
    lockEvent,
    payMyShare
  } = useEvents();
const { user } = useAuth();

  const [showAddForm, setShowAddForm] = useState(false);
  const [showReconciliation, setShowReconciliation] = useState(false);
  const [expName, setExpName] = useState("");
  const [expAmount, setExpAmount] = useState("");
  const [expPayer, setExpPayer] = useState(null);
  const [expBeneficiaries, setExpBeneficiaries] = useState([]);


  const [newParticipant, setNewParticipant] = useState(null);
  const [inviting, setInviting] = useState(false);


  const event = events.find((e) => e.id === eventId);
const [loading, setLoading] = useState(true);

const participantDict = React.useMemo(() => {
  const dict = {};
  (event?.participants || []).forEach(p => {
    dict[p.id] = { name: p.name, email: p.id };
  });
  return dict;
}, [event]);

const participantsOptions = React.useMemo(() => {
  if (!event) return [];


  const alreadyInList = event.participants.some(
    p => p.id === user.uid || p.id === user.email
  );


  const raw = [...event.participants];


  if (!alreadyInList) {
    raw.push({ id: user.uid, name: user.email });
  }


  const mapByLabel = new Map();
  raw.forEach(p => {
    mapByLabel.set(p.name, p);        
  });

  return Array.from(mapByLabel.values());
}, [event, user.uid, user.email]);


const labelDict = React.useMemo(() => {
  const dict = {};


  (event?.participants || []).forEach(p => {
    dict[p.id] = p.name || p.id;
  });


  friends.forEach(f => {
    if (!dict[f.uid]) dict[f.uid] = f.email;
  });


  if (!dict[user.uid]) dict[user.uid] = user.email;


  (event?.expenses || []).forEach(exp => {
    if (!dict[exp.payerId]) dict[exp.payerId] = exp.payerId;
    exp.beneficiaries.forEach(uid => {
      if (!dict[uid]) dict[uid] = uid;         
    });
  });

  return dict;
}, [event, friends, user]);

useEffect(() => {
  if (!event) return;                 
  if (event.expenses.length > 0) {
    setLoading(false);                
  } else {
    loadEventDetails(eventId).finally(() => setLoading(false));
  }
}, [event, eventId, loadEventDetails]);

if (loading) {
  return (
    <Box
      sx={{ width: "100%", height: "70vh", display: "flex",
            alignItems: "center", justifyContent: "center" }}
    >
      <CircularProgress size={60} />
    </Box>
  );
}
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
        <Paper sx={{ p: 4, backgroundColor: "#1e1e1e", textAlign: "center" }}>
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


  const handleAddExpense = async (e) => {
  e.preventDefault();
  if (!expName || !expAmount || !expPayer || !expBeneficiaries.length) {
    alert("Uzupełnij wszystkie dane!");
    return;
  }

  await addExpense(eventId, {
  name: expName.trim(),
  amount: Number(expAmount),
  payer: { id: expPayer.id },             
  beneficiaries: expBeneficiaries         
                  .filter(b => b.id !== expPayer.id)   
                  .map(b => ({ id: b.id })),
});

  setExpName("");
  setExpAmount("");
  setExpPayer(null);
  setExpBeneficiaries([]);
  setShowAddForm(false);
};

const handleFinishAdding = async () => {
  setShowAddForm(false);
  await lockEvent(eventId);          
  setShowReconciliation(true);       
};


let reconciliationData = [];
if (showReconciliation) {
  const balances = {};                          


  Object.keys(labelDict).forEach(uid => {
    balances[uid] = { paid: 0, owe: 0 };
  });

  event.expenses.forEach(exp => {
    const share = exp.amount / exp.beneficiaries.length;


    if (!balances[exp.payerId]) balances[exp.payerId] = { paid: 0, owe: 0 };
    balances[exp.payerId].paid += exp.amount;


    exp.beneficiaries.forEach(uid => {
      if (!balances[uid]) balances[uid] = { paid: 0, owe: 0 };


      if (exp.paidBy.includes(uid)) {
        balances[uid].paid += share;
      } else {
      
        balances[uid].owe += share;
      }
    });
  });


  const labelTotals = {};
  Object.entries(balances).forEach(([uid, { paid, owe }]) => {
    const label = labelDict[uid] || uid;
    if (!labelTotals[label]) labelTotals[label] = { paid: 0, owe: 0 };
    labelTotals[label].paid += paid;
    labelTotals[label].owe  += owe;
  });


  reconciliationData = Object.entries(labelTotals).map(([label, { paid, owe }]) => ({
    label,
    paid: paid.toFixed(2),
    owe:  owe.toFixed(2),
    net:  (paid - owe).toFixed(2)
  }));
}




const handleInvite = async () => {
  if (!newParticipant) return;
  setInviting(true);
  try {
    await addParticipant(eventId, newParticipant); 
  } catch (err) {
    console.error("Błąd zapraszania:", err);
  } finally {
    setInviting(false);
    setNewParticipant(null);
  }
};



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
          <Typography variant="h6" sx={{ mb: 2, color:"white" }}>
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
  {reconciliationData.map(row => (
    <TableRow key={row.label}>
      <TableCell sx={{ color: "#ffffff" }}>{row.label}</TableCell>
      <TableCell sx={{ color: "#ffffff" }}>{row.paid}</TableCell>
      <TableCell sx={{ color: "#ffffff" }}>{row.owe}</TableCell>
      <TableCell
        sx={{ color: Number(row.net) < 0 ? "#ff6666" : "#2ecc71" }}
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
               <Box sx={{ textAlign: "center", mt: 2 }}>
  <Button
    variant="contained"
    color="success"
    onClick={() => setShowAddForm(true)}
    sx={{ textTransform: "none", mr: 2 }}
  >
    Dodaj wydatek
  </Button>

  {event.status === "OPEN" && (
    <Button
      variant="contained"
      color="primary"
      onClick={handleFinishAdding}
      sx={{ textTransform: "none", mr: 2 }}
    >
      Zakończ dodawanie
    </Button>
  )}

  {!showReconciliation && (
    <Button
      variant="contained"
      color="info"
      onClick={() => setShowReconciliation(true)}
      sx={{ textTransform: "none" }}
    >
      Podsumowanie
    </Button>
  )}
</Box>
              )}
<Button
  variant="contained"
  color="info"
  onClick={() => setShowReconciliation(true)}
  sx={{ textTransform: "none", ml: 2 }}
>
  Podsumowanie
</Button>
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
  {event.expenses.map(exp => {

    const iHaveToPay =
      event.status === "LOCKED" &&
      !exp.isPaid &&
      exp.beneficiaries.includes(user.uid);

    return (
      <TableRow key={exp.id}>
        <TableCell sx={{ color: "#fff" }}>{exp.name}</TableCell>
        <TableCell sx={{ color: "#fff" }}>{exp.amount} zł</TableCell>
        <TableCell sx={{ color: "#fff" }}>{exp.payerName}</TableCell>
        <TableCell sx={{ color: "#fff"}}>
  {exp.beneficiaries
       .map(uid => labelDict[uid] || uid)
       .join(", ")}
</TableCell>

        <TableCell sx={{ color: "#fff" }}>
          {/*  👉  Przycisk widzi tylko beneficjent, który jeszcze nie zapłacił */}
          {iHaveToPay && (
            <Button
              size="small"
              variant="outlined"
              color="success"
              onClick={() => payMyShare(event.id, exp.id)}
            >
              Zapłać
            </Button>
          )}

          {/* Tekstowy status zawsze widać */}
          {exp.isPaid ? "Zapłacony" : exp.status}
        </TableCell>
      </TableRow>
    );
  })}
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
  sx={{ color: "#ffffff" }}
>
  {participantsOptions.map((p) => (
    <MenuItem key={p.id} value={p.id}>
      {p.name}
    </MenuItem>
  ))}
</Select>
                  </FormControl>


                  <Autocomplete
                    multiple
                    options={participantsOptions}
                    filterSelectedOptions          
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

        {/* Prawa: uczestnicy i zaproszenie */}
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
                <Stack key={p.id} direction="row" alignItems="center" spacing={2}>
                  <Avatar sx={{ bgcolor: "#2ecc71" }}>
  {p.name ? p.name.charAt(0).toUpperCase() : "?"}
</Avatar>
                  <Typography>{p.name}</Typography>
                </Stack>
              ))}
            </Stack>
          )}

          <Typography variant="subtitle2" sx={{ mt: 3, mb: 1 }}>
            Zaproś znajomego
          </Typography>
          <Autocomplete
            options={friends}
            getOptionLabel={(f) => f.email}
            filterSelectedOptions          
            value={newParticipant}
            onChange={(_, val) => setNewParticipant(val)}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Wybierz znajomego"
                variant="filled"
                size="small"
                sx={{
                  backgroundColor: "rgba(255,255,255,0.1)",
                  "& .MuiFilledInput-root": { borderRadius: 1 },
                  input: { color: "#ffffff" },
                  "& .MuiFormLabel-root": { color: "rgba(255,255,255,0.7)" },
                }}
              />
            )}
            sx={{ mb: 1 }}
          />
          <Button
            variant="contained"
            color="success"
            fullWidth
            disabled={!newParticipant || inviting}
            onClick={handleInvite}
            sx={{ textTransform: "none", borderRadius: 25, py: 1 }}
          >
            {inviting ? "Zapraszam..." : "Zaproś"}
          </Button>
        </Paper>
      </Box>
    </Box>
  );
};

export default EventDetailsPage;