// src/components/Layout.jsx
import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Box,
  Tooltip,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Divider,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import MenuIcon from "@mui/icons-material/Menu";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import InfoIcon from "@mui/icons-material/Info";
import HomeIcon from "@mui/icons-material/Home";
import { useAuth } from "../context/AuthContext";

const Header = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  // Hooki MUI do sprawdzenia breakpointów
  const theme = useTheme();
  const isSmUp = useMediaQuery(theme.breakpoints.up("sm"));

  // Stan do otwierania/zamykania Drawer
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleLogout = () => {
    setDrawerOpen(false);
    logout();
    navigate("/signin");
  };

  const goHome = () => {
    setDrawerOpen(false);
    navigate("/dashboard");
  };

  return (
    <>
      <AppBar position="static" sx={{ backgroundColor: "#2ea46b" }} elevation={0}>
        <Toolbar sx={{ px: { xs: 1, sm: 2, md: 3 } }}>
          {/* Ikona Menu (hamburger) */}
          <IconButton
            edge="start"
            color="inherit"
            aria-label="menu"
            onClick={() => setDrawerOpen(true)}
            sx={{ mr: { xs: 0.5, sm: 1, md: 2 } }}
          >
            <MenuIcon sx={{ fontSize: { xs: 20, sm: 24, md: 28 } }} />
          </IconButton>

          {/* Logotyp + napis „SplitBill” tylko na ekranach ≥ sm */}
          {isSmUp && (
            <Box
              component={RouterLink}
              to="/dashboard"
              sx={{
                display: "flex",
                alignItems: "center",
                textDecoration: "none",
                color: "inherit",
                mr: { sm: 1, md: 2 },
              }}
            >
              <Box
                component="img"
                src="/images/logo.png"
                alt="SplitBill Logo"
                sx={{
                  width: 32,
                  height: 32,
                  mr: 1,
                }}
              />
              <Typography
                variant="h6"
                component="div"
                sx={{
                  fontSize: { sm: "1.25rem", md: "1.5rem" },
                  whiteSpace: "nowrap",
                }}
              >
                SplitBill
              </Typography>
            </Box>
          )}

          <Box sx={{ flexGrow: 1 }} />

          {/* Ikona „Mój profil” */}
          <Tooltip title="Mój profil">
            <IconButton color="inherit" sx={{ mr: { xs: 0.5, sm: 1, md: 1 } }}>
              <AccountCircleIcon sx={{ fontSize: { xs: 20, sm: 24, md: 28 } }} />
            </IconButton>
          </Tooltip>

          {/* Ikona „Moje wydarzenia” */}
          <Tooltip title="Moje wydarzenia">
            <IconButton color="inherit" sx={{ mr: { xs: 0.5, sm: 1, md: 1 } }}>
              <CalendarTodayIcon sx={{ fontSize: { xs: 20, sm: 24, md: 28 } }} />
            </IconButton>
          </Tooltip>

          {/* Ikona „O nas” prowadząca do /about */}
          <Tooltip title="O nas">
            <IconButton
              color="inherit"
              component={RouterLink}
              to="/about"
              sx={{ mr: { xs: 0.5, sm: 1, md: 2 } }}
            >
              <InfoIcon sx={{ fontSize: { xs: 20, sm: 24, md: 28 } }} />
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>

      {/* Drawer (wysuwane menu) */}
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        PaperProps={{
          sx: {
            backgroundColor: "#1e1e1e",
            width: { xs: 180, sm: 240 },
          },
        }}
      >
        <Box
          sx={{
            width: "100%",
            color: "#ffffff",
            display: "flex",
            flexDirection: "column",
            height: "100%",
          }}
          role="presentation"
        >
          <Typography
            variant="h6"
            sx={{
              p: 2,
              textAlign: "center",
              borderBottom: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            Menu
          </Typography>

          <List sx={{ flexGrow: 1, p: 0 }}>
            {/* Strona główna */}
            <ListItem disablePadding>
              <ListItemButton onClick={goHome}>
                <HomeIcon sx={{ color: "#ffffff", mr: 1, fontSize: "1.2rem" }} />
                <ListItemText
                  primary="Strona główna"
                  primaryTypographyProps={{ color: "#ffffff" }}
                />
              </ListItemButton>
            </ListItem>

            {/* Wyloguj */}
            <ListItem disablePadding>
              <ListItemButton onClick={handleLogout}>
                <ListItemText
                  primary="Wyloguj"
                  primaryTypographyProps={{ color: "#ffffff" }}
                />
              </ListItemButton>
            </ListItem>
          </List>

          <Divider sx={{ borderColor: "rgba(255,255,255,0.1)" }} />

          <Box sx={{ p: 2 }}>
            <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.6)" }}>
              SplitBill © {new Date().getFullYear()}
            </Typography>
          </Box>
        </Box>
      </Drawer>
    </>
  );
};

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        mt: "auto",
        py: { xs: 1, sm: 2 },
        textAlign: "center",
        backgroundColor: "#181818",
        color: "rgba(255,255,255,0.7)",
        fontSize: { xs: "0.7rem", sm: "0.875rem" },
      }}
    >
      © {new Date().getFullYear()} SplitBill. Wszelkie prawa zastrzeżone.
    </Box>
  );
};

const Layout = ({ children }) => {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        backgroundColor: "#121212",
      }}
    >
      <Header />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, sm: 3, md: 4 },
          overflowY: "auto",
        }}
      >
        {children}
      </Box>

      <Footer />
    </Box>
  );
};

export default Layout;
