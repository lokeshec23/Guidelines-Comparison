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
        ml: isSidebarExpanded ? "240px" : "80px",
        mt: "64px", // header
        mb: "25px", // ✅ updated footer height
        transition: "margin-left 0.25s ease",
        bgcolor: "background.default",
        minHeight: "calc(100vh - 89px)", // ✅ 64 header + 25 footer
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        width: "100%",
      }}
    >
      <Typography
        variant="h3"
        fontWeight={600}
        color="primary.main"
        sx={{ letterSpacing: 0.5 }}
      >
        {activeSection}
      </Typography>
    </Box>
  );
};

export default MainContent;
