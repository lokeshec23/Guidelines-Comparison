// src/api/axiosInstance.js
import axios from "axios";

// Create axios instance
const api = axios.create({
  baseURL: "http://localhost:8000", // your FastAPI backend
  headers: {
    "Content-Type": "application/json",
  },
});

// Helper to get tokens from sessionStorage
const getTokens = () => {
  const access = sessionStorage.getItem("accessToken");
  const refresh = sessionStorage.getItem("refreshToken");
  return { access, refresh };
};

// Attach access token to every request
api.interceptors.request.use(
  (config) => {
    const { access } = getTokens();
    if (access) {
      config.headers.Authorization = `Bearer ${access}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle expired tokens & refresh automatically
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const { refresh } = getTokens();

    // If token expired and refresh token exists
    if (error.response?.status === 401 && refresh && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const res = await axios.post("http://localhost:8000/auth/refresh", {
          refresh_token: refresh,
        });

        const newAccess = res.data.access_token;
        sessionStorage.setItem("accessToken", newAccess);

        api.defaults.headers.Authorization = `Bearer ${newAccess}`;
        originalRequest.headers.Authorization = `Bearer ${newAccess}`;

        return api(originalRequest); // retry the request
      } catch (refreshError) {
        console.error("Token refresh failed:", refreshError);
        sessionStorage.clear();
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export default api;
