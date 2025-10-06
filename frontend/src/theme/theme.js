// src/theme/theme.js
import { createTheme } from "@mui/material/styles";

// Custom MUI theme setup
const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#1976d2", // blue accent
    },
    secondary: {
      main: "#455a64", // gray-blue tone
    },
    background: {
      default: "#f4f6f8",
      paper: "#ffffff",
    },
    text: {
      primary: "#212121",
      secondary: "#555555",
    },
  },
  typography: {
    fontFamily: "'Inter', 'Roboto', sans-serif",
    button: {
      textTransform: "none",
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
        },
      },
    },
  },
});

export default theme;
