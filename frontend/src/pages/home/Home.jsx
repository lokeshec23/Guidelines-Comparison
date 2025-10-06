// src/pages/home/Home.jsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Box } from "@mui/material";
import Header from "../../components/Header";
import Dashboard from "./Dashboard";

const Home = () => {
  return (
    <Box minHeight="100vh" bgcolor="background.default">
      {/* Fixed Header */}
      <Header />

      {/* Page content below header */}
      <Box
        component="main"
        sx={{
          pt: "80px", // ✅ offset for fixed header (toolbar height)
          px: 3,
        }}
      >
        <Routes>
          <Route path="/" element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="*" element={<Navigate to="dashboard" replace />} />
        </Routes>
      </Box>
    </Box>
  );
};

export default Home;
