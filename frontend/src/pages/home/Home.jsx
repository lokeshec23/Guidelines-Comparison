// src/pages/home/Home.jsx
import React from "react";
import { Box } from "@mui/material";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import Sidebar from "../../layout/Sidebar";
import MainContent from "../../layout/MainContent";
import { HomeLayoutProvider } from "../../layout/HomeLayoutContext";

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
        {/* Fixed Header */}
        <Header />

        {/* Sidebar + Main Area */}
        <Box sx={{ display: "flex", flexGrow: 1 }}>
          <Sidebar />
          <MainContent />
        </Box>

        {/* Fixed Footer */}
        <Footer />
      </Box>
    </HomeLayoutProvider>
  );
};

export default Home;
