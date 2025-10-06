// src/layout/Sidebar.jsx
import React, { useEffect } from "react";
import {
  Box,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  Tooltip,
} from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import SettingsIcon from "@mui/icons-material/Settings";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { useHomeLayout } from "./HomeLayoutContext";
import { useNavigate, useLocation } from "react-router-dom";

const Sidebar = () => {
  const { isSidebarExpanded, toggleSidebar, activeSection, changeSection } =
    useHomeLayout();

  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { label: "Dashboard", icon: <DashboardIcon />, path: "/home/dashboard" },
    { label: "Ingestion", icon: <CloudUploadIcon />, path: "/home/ingestion" },
    { label: "Settings", icon: <SettingsIcon />, path: "/home/settings" },
  ];

  // Keep context synced with route
  useEffect(() => {
    try {
      const found = menuItems.find((item) => location.pathname === item.path);
      if (found) changeSection(found.label);
    } catch (error) {
      console.error("Sidebar route sync error:", error);
    }
  }, [location.pathname]);

  // Navigation handler
  const handleNavigation = (item) => {
    try {
      navigate(item.path);
      changeSection(item.label);
    } catch (error) {
      console.error("Sidebar navigation error:", error);
    }
  };

  return (
    <Box
      sx={{
        width: isSidebarExpanded ? 240 : 80,
        transition: "width 0.25s ease",
        height: "calc(100vh - 89px)", // header + footer
        bgcolor: "background.paper",
        borderRight: "1px solid #e0e0e0",
        position: "fixed",
        top: 64,
        bottom: 25,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        zIndex: 10,
      }}
    >
      {/* Expand/Collapse button */}
      <Box
        sx={{
          display: "flex",
          justifyContent: isSidebarExpanded ? "flex-end" : "center",
          p: 1,
          borderBottom: "1px solid #e0e0e0",
        }}
      >
        <IconButton
          onClick={toggleSidebar}
          size="small"
          color="primary"
          sx={{
            transition: "transform 0.2s",
            "&:hover": { bgcolor: "primary.light" },
          }}
        >
          {isSidebarExpanded ? <ChevronLeftIcon /> : <ChevronRightIcon />}
        </IconButton>
      </Box>

      {/* Menu Items */}
      <List sx={{ flexGrow: 1, mt: 1 }}>
        {menuItems.map((item) => {
          const isActive = activeSection === item.label;
          return (
            <Tooltip
              key={item.label}
              title={!isSidebarExpanded ? item.label : ""}
              placement="right"
              arrow
            >
              <ListItemButton
                onClick={() => handleNavigation(item)}
                sx={{
                  py: 1.5,
                  px: isSidebarExpanded ? 2 : 0,
                  mx: isSidebarExpanded ? 1 : 0,
                  justifyContent: isSidebarExpanded ? "flex-start" : "center",
                  "&:hover": { bgcolor: "action.hover" },
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    justifyContent: "center",
                    color: isActive ? "primary.main" : "text.secondary",
                    transform: isActive ? "scale(1.15)" : "scale(1)",
                    transition: "all 0.25s ease",
                  }}
                >
                  {item.icon}
                </ListItemIcon>

                {isSidebarExpanded && (
                  <Box
                    sx={{
                      ml: 2,
                      fontSize: 15,
                      fontWeight: 500,
                      color: isActive ? "primary.main" : "text.secondary",
                      transition: "color 0.3s ease",
                    }}
                  >
                    {item.label}
                  </Box>
                )}
              </ListItemButton>
            </Tooltip>
          );
        })}
      </List>
    </Box>
  );
};

export default Sidebar;
