// src/layout/MainContent.jsx
import React from "react";
import { Box, Typography, Paper } from "@mui/material";
import { useHomeLayout } from "./HomeLayoutContext";

const MainContent = () => {
  const { isSidebarExpanded, activeSection } = useHomeLayout();

  return (
    <Box
      component="main"
      sx={{
        ml: isSidebarExpanded ? "240px" : "80px", // space for sidebar
        mt: "64px", // below header
        mb: "64px", // above footer
        p: 3,
        transition: "margin-left 0.25s ease",
        bgcolor: "background.default",
        minHeight: "calc(100vh - 128px)",
        overflow: "auto",
      }}
    >
      <Paper
        elevation={3}
        sx={{
          p: 4,
          minHeight: "200px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 3,
        }}
      >
        <Typography variant="h4" fontWeight={600} color="primary.main">
          {activeSection}
        </Typography>
      </Paper>
    </Box>
  );
};

export default MainContent;
