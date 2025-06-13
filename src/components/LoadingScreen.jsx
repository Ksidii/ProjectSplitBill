import React from "react";
import { Box, CircularProgress } from "@mui/material";

const LoadingScreen = ({ fullHeight = "70vh" }) => (
  <Box
    sx={{
      width: "100%",
      height: fullHeight,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}
  >
    <CircularProgress size={60} />
  </Box>
);

export default LoadingScreen;