// src/context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from "react";
import api from "../api/axiosInstance";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const access = sessionStorage.getItem("accessToken");
    if (access) fetchUser();
    else setLoading(false);
  }, []);

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

  // ✅ UPDATED: After successful registration → navigate to login (not auto-login)
  const register = async (username, email, password) => {
    try {
      await api.post("/auth/register", { username, email, password });
      navigate("/login"); // 👈 redirect to login instead of auto-login
    } catch (err) {
      throw err.response?.data?.detail || "Registration failed.";
    }
  };

  // ✅ Login user
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

  const logout = () => {
    sessionStorage.clear();
    setUser(null);
    navigate("/login");
  };

  const value = { user, loading, register, login, logout };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
