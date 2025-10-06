// src/pages/home/Home.jsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Box } from "@mui/material";
import Header from "../../components/Header";
import Dashboard from "./Dashboard";

const Home = () => {
  return (
    <Box minHeight="100vh" bgcolor="background.default">
      {/* Persistent Header */}
      <Header />

      {/* Nested content area */}
      <Box p={3}>
        <Routes>
          <Route path="/" element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />

          {/* Future routes can go here */}
          {/* <Route path="profile" element={<Profile />} /> */}
          {/* <Route path="settings" element={<Settings />} /> */}

          {/* Catch-all for invalid paths under /home */}
          <Route path="*" element={<Navigate to="dashboard" replace />} />
        </Routes>
      </Box>
    </Box>
  );
};

export default Home;
