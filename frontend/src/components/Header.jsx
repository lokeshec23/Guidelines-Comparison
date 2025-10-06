// src/components/Header.jsx
import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Avatar,
  Menu,
  MenuItem,
  Box,
  IconButton,
} from "@mui/material";
import { useAuth } from "../context/AuthContext";
import { deepPurple } from "@mui/material/colors";
import LogoutIcon from "@mui/icons-material/Logout";
import Logo from "/vite.svg"; // Vite logo

const Header = () => {
  const { user, logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState(null);

  // open/close avatar menu
  const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  // first letter of username (capitalized)
  const initial = user?.username?.charAt(0)?.toUpperCase() || "?";

  return (
    <AppBar position="static" color="inherit" elevation={1}>
      <Toolbar
        sx={{
          display: "flex",
          justifyContent: "space-between",
          px: 3,
        }}
      >
        {/* Left: Logo + Title */}
        <Box display="flex" alignItems="center" gap={1}>
          <img src={Logo} alt="Logo" width="35" height="35" />
          <Typography
            variant="h6"
            sx={{ fontWeight: 600, color: "primary.main" }}
          >
            Dashboard
          </Typography>
        </Box>

        {/* Right: Avatar */}
        <Box>
          <IconButton onClick={handleMenuOpen} size="small">
            <Avatar sx={{ bgcolor: deepPurple[500], width: 40, height: 40 }}>
              {initial}
            </Avatar>
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            transformOrigin={{ horizontal: "right", vertical: "top" }}
            anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
          >
            <MenuItem
              onClick={() => {
                handleMenuClose();
                logout();
              }}
            >
              <LogoutIcon fontSize="small" sx={{ mr: 1 }} /> Logout
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
