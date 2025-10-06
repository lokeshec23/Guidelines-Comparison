// src/context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from "react";
import api from "../api/axiosInstance";
import { useNavigate } from "react-router-dom";

// Create context
const AuthContext = createContext();

// Custom hook for easy access
export const useAuth = () => useContext(AuthContext);

// Provider component
export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On mount, check if tokens exist and fetch user
  useEffect(() => {
    const access = sessionStorage.getItem("accessToken");
    if (access) {
      fetchUser();
    } else {
      setLoading(false);
    }
  }, []);

  // Fetch current user from backend
  const fetchUser = async () => {
    try {
      const res = await api.get("/auth/me");
      setUser(res.data);
    } catch (err) {
      console.error("Fetch user failed:", err);
      sessionStorage.clear();
      navigate("/login");
    } finally {
      setLoading(false);
    }
  };

  // Register user
  const register = async (username, email, password) => {
    try {
      await api.post("/auth/register", { username, email, password });
      await login(email, password);
    } catch (err) {
      throw err.response?.data?.detail || "Registration failed.";
    }
  };

  // Login user
  const login = async (email, password) => {
    try {
      const res = await api.post("/auth/login", { email, password });

      const { access_token, refresh_token, user: userData } = res.data;
      sessionStorage.setItem("accessToken", access_token);
      sessionStorage.setItem("refreshToken", refresh_token);

      setUser(userData);
      navigate("/dashboard");
    } catch (err) {
      throw err.response?.data?.detail || "Invalid credentials.";
    }
  };

  // Logout user
  const logout = () => {
    sessionStorage.clear();
    setUser(null);
    navigate("/login");
  };

  const value = {
    user,
    loading,
    register,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
