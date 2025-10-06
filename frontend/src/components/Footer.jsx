// src/layout/Footer.jsx
import React from "react";
import { Box, Typography } from "@mui/material";

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        height: "64px",
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        bgcolor: "background.paper",
        borderTop: "1px solid #e0e0e0",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: (theme) => theme.zIndex.drawer + 1,
      }}
    >
      <Typography variant="body2" color="text.secondary">
        © 2025 Guidelines Comparison - LOANDNA
      </Typography>
    </Box>
  );
};

export default Footer;
