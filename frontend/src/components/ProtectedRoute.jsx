// src/components/ProtectedRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>; // simple fallback — you can replace with MUI spinner
  }

  // if no user → redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // else → render the requested component
  return children;
};

export default ProtectedRoute;
