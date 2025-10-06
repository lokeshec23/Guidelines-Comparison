// src/App.jsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

// Auth pages
import Register from "./pages/auth/Register";
import Login from "./pages/auth/Login";

// Dashboard
import Dashboard from "./pages/dashboard/Dashboard";

const App = () => {
  return (
    <AuthProvider>
      <Routes>
        {/* Default redirect to login */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Auth Routes */}
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />

        {/* Protected Dashboard */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* Catch-all fallback */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </AuthProvider>
  );
};

export default App;
