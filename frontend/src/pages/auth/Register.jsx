// src/pages/auth/Register.jsx
import React, { useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Alert,
  CircularProgress,
} from "@mui/material";
import { useAuth } from "../../context/AuthContext";
import { Link } from "react-router-dom";

const Register = () => {
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register(formData.username, formData.email, formData.password);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
      bgcolor="background.default"
    >
      <Paper
        elevation={3}
        sx={{
          p: 4,
          width: 400,
          borderRadius: 3,
        }}
      >
        <Typography variant="h5" fontWeight={600} mb={3} textAlign="center">
          Create Account
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <TextField
            label="Username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            fullWidth
            margin="normal"
            required
          />
          <TextField
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            fullWidth
            margin="normal"
            required
          />
          <TextField
            label="Password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            fullWidth
            margin="normal"
            required
          />

          <Button
            variant="contained"
            color="primary"
            type="submit"
            fullWidth
            sx={{ mt: 2, py: 1.2 }}
            disabled={loading}
          >
            {loading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              "Register"
            )}
          </Button>
        </form>

        <Typography variant="body2" mt={2} textAlign="center">
          Already have an account?{" "}
          <Link
            to="/login"
            style={{ textDecoration: "none", color: "#1976d2" }}
          >
            Login
          </Link>
        </Typography>
      </Paper>
    </Box>
  );
};

export default Register;
