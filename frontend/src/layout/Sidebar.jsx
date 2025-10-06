// src/layout/Sidebar.jsx
import React from "react";
import {
  Box,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
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
        height: "calc(100vh - 128px)", // excluding header/footer
        bgcolor: "background.paper",
        borderRight: "1px solid #e0e0e0",
        position: "fixed",
        top: 64,
        bottom: 64,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        zIndex: 10,
      }}
    >
      {/* Expand/Collapse at Top */}
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
              onClick={() => changeSection(item.label)}
              sx={{
                py: 1.5,
                px: isSidebarExpanded ? 2 : 0,
                mx: isSidebarExpanded ? 1 : 0,
                justifyContent: isSidebarExpanded ? "flex-start" : "center",
                "&:hover": {
                  bgcolor: "action.hover",
                },
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 0,
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
                <Box
                  sx={{
                    ml: 2,
                    fontSize: 15,
                    fontWeight: 500,
                    color:
                      activeSection === item.label
                        ? "primary.main"
                        : "text.secondary",
                  }}
                >
                  {item.label}
                </Box>
              )}
            </ListItemButton>
          </Tooltip>
        ))}
      </List>
    </Box>
  );
};

export default Sidebar;
