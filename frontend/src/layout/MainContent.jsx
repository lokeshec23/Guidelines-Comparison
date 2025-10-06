// src/layout/MainContent.jsx
import React from "react";
import { Box, Typography } from "@mui/material";
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
        transition: "margin-left 0.25s ease",
        bgcolor: "background.default",
        minHeight: "calc(100vh - 128px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
      }}
    >
      <Typography
        variant="h3"
        fontWeight={600}
        color="primary.main"
        sx={{
          letterSpacing: 0.5,
        }}
      >
        {activeSection}
      </Typography>
    </Box>
  );
};

export default MainContent;
