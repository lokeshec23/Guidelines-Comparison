// src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider, CssBaseline } from "@mui/material";
import theme from "./theme/theme.js";
import "./index.css";

import { LoaderProvider } from "./context/LoaderContext.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <LoaderProvider>
        <ThemeProvider theme={theme}>
          {/* CssBaseline gives a clean, consistent default style */}
          <CssBaseline />
          <App />
        </ThemeProvider>
      </LoaderProvider>
    </BrowserRouter>
  </React.StrictMode>
);
