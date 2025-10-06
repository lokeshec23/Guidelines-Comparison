// src/layout/Sidebar.jsx
import React from "react";
import {
  Box,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Tooltip,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import SettingsIcon from "@mui/icons-material/Settings";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { useHomeLayout } from "./HomeLayoutContext";

const Sidebar = () => {
  const { isSidebarExpanded, toggleSidebar, activeSection, changeSection } =
    useHomeLayout();

  const menuItems = [
    { label: "Ingestion", icon: <CloudUploadIcon /> },
    { label: "Settings", icon: <SettingsIcon /> },
  ];

  return (
    <Box
      sx={{
        width: isSidebarExpanded ? 240 : 80,
        transition: "width 0.25s ease",
        height: "calc(100vh - 128px)", // excluding header & footer height
        bgcolor: "background.paper",
        borderRight: "1px solid #e0e0e0",
        position: "fixed",
        top: 64, // below header
        bottom: 64, // above footer
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        overflow: "hidden",
        zIndex: 10,
      }}
    >
      {/* Sidebar Menu */}
      <List sx={{ flexGrow: 1, mt: 2 }}>
        {menuItems.map((item) => (
          <Tooltip
            key={item.label}
            title={!isSidebarExpanded ? item.label : ""}
            placement="right"
            arrow
          >
            <ListItemButton
              selected={activeSection === item.label}
              onClick={() => changeSection(item.label)}
              sx={{
                py: 1.5,
                px: 2,
                borderRadius: 2,
                mx: 1,
                mb: 1,
                "&.Mui-selected": {
                  bgcolor: "primary.light",
                  color: "primary.main",
                  "&:hover": {
                    bgcolor: "primary.light",
                  },
                },
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 0,
                  mr: isSidebarExpanded ? 2 : "auto",
                  justifyContent: "center",
                  color:
                    activeSection === item.label
                      ? "primary.main"
                      : "text.secondary",
                }}
              >
                {item.icon}
              </ListItemIcon>
              {isSidebarExpanded && (
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{
                    fontSize: 15,
                    fontWeight: activeSection === item.label ? 600 : 500,
                  }}
                />
              )}
            </ListItemButton>
          </Tooltip>
        ))}
      </List>

      {/* Expand/Collapse Button */}
      <Box
        sx={{
          display: "flex",
          justifyContent: isSidebarExpanded ? "flex-end" : "center",
          p: 1,
          borderTop: "1px solid #e0e0e0",
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
    </Box>
  );
};

export default Sidebar;
