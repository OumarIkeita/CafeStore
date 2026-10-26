import axios from "axios";

const baseURL = import.meta.env.VITE_BACKEND_BASE_API;

const api = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Used to refresh tokens without triggering this instance's interceptors.
const refreshClient = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach the access token to each API request.
api.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem("accessToken");

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

// Refresh an expired access token and retry the failed request.
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status !== 401 ||
      !originalRequest ||
      originalRequest._retry ||
      originalRequest.url?.includes("token/refresh/") ||
      originalRequest.url?.includes("login/")
    ) {
      return Promise.reject(error);
    }

    const refreshToken = localStorage.getItem("refreshToken");

    if (!refreshToken) {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      const response = await refreshClient.post("token/refresh/", {
        refresh: refreshToken,
      });

      const newAccessToken = response.data.access;

      if (!newAccessToken) {
        throw new Error("Refresh response did not contain an access token.");
      }

      localStorage.setItem("accessToken", newAccessToken);

      // Save the rotated refresh token if Django returned one.
      if (response.data.refresh) {
        localStorage.setItem("refreshToken", response.data.refresh);
      }

      originalRequest.headers = originalRequest.headers || {};
      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

      return api(originalRequest);
    } catch (refreshError) {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");

      window.location.assign("/login");

      return Promise.reject(refreshError);
    }
  },
);

export default api;
