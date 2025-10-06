// src/pages/dashboard/Dashboard.jsx
import React from "react";
import { Box, Typography, Paper } from "@mui/material";
import Header from "../../components/Header";
import { useAuth } from "../../context/AuthContext";

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <Box minHeight="100vh" bgcolor="background.default">
      {/* Header at the top */}
      <Header />

      {/* Dashboard content */}
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="calc(100vh - 64px)" // minus header height
      >
        <Paper
          elevation={3}
          sx={{
            p: 4,
            borderRadius: 3,
            minWidth: 400,
            textAlign: "center",
          }}
        >
          <Typography variant="h5" fontWeight={600} mb={1}>
            Welcome, {user?.username || "User"} 👋
          </Typography>
          <Typography variant="body1" color="text.secondary">
            You’ve successfully logged in using JWT authentication.
          </Typography>
        </Paper>
      </Box>
    </Box>
  );
};

export default Dashboard;
