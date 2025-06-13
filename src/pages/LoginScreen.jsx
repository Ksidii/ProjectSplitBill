
import React, { useEffect } from "react";
import { Box } from "@mui/material";
import LeftPanel from "../components/LeftPanel";
import RightPanel from "../components/RightPanel";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const LoginScreen = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: { xs: "column", md: "row" },
        width: "100%",
        height: "100vh",
        overflow: "hidden",
      }}
    >

      <Box
        sx={{
          flex: { xs: "none", md: 6 },
          width: { xs: "100%", md: "auto" },
          height: { xs: "50vh", md: "100%" },
        }}
      >
        <LeftPanel />
      </Box>


      <Box
        sx={{
          flex: { xs: "none", md: 4 },
          width: { xs: "100%", md: "auto" },
          height: { xs: "50vh", md: "100%" },
        }}
      >
        <RightPanel />
      </Box>
    </Box>
  );
};

export default LoginScreen;
