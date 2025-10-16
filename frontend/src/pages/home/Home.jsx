// src/pages/home/Home.jsx
import React from "react";
import { Box, Typography } from "@mui/material";
import Header from "../../components/Header";
// import Footer from "../../components/Footer";
import Sidebar from "../../layout/Sidebar";
import { HomeLayoutProvider } from "../../layout/HomeLayoutContext";
import { Routes, Route, Navigate } from "react-router-dom";
import IngestionModal from "../../components/ingestion/IngestionModal";
import Dashboard from "../../pages/home/Dashboard";
const Home = () => {
  return (
    <HomeLayoutProvider>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          minHeight: "100vh",
          bgcolor: "background.default",
        }}
      >
        <Header />

        {/* Sidebar + Route-based Main Area */}
        <Box sx={{ display: "flex", flexGrow: 1 }}>
          <Sidebar />

          <Box
            component="main"
            sx={{
              flexGrow: 1,
              ml: { xs: "80px", sm: "80px" },
              transition: "margin-left 0.25s ease",
              mt: "64px",
              mb: "25px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Routes>
              <Route
                path="/"
                element={<Navigate to="/home/dashboard" replace />}
              />
              <Route
                path="dashboard"
                element={
                  <Typography
                    variant="h3"
                    color="primary.main"
                    fontWeight={600}
                  >
                    <Dashboard />
                  </Typography>
                }
              />
              <Route
                path="ingestion"
                element={
                  <Typography
                    variant="h3"
                    color="primary.main"
                    fontWeight={600}
                  >
                    <IngestionModal />
                  </Typography>
                }
              />
              <Route
                path="settings"
                element={
                  <Typography
                    variant="h3"
                    color="primary.main"
                    fontWeight={600}
                  >
                    Settings
                  </Typography>
                }
              />
            </Routes>
          </Box>
        </Box>

        {/* <Footer /> */}
      </Box>
    </HomeLayoutProvider>
  );
};

export default Home;
