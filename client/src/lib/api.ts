import axios from "axios";
import { useAuthStore } from "@/store/authStore";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
  timeout: 15000,
});

// Uploads (audio/cover files) need far more headroom than regular JSON
// requests — a 15s timeout was aborting the browser's in-flight upload
// mid-write, which is what caused ERR_UPLOAD_FILE_CHANGED on retry.
// This mirrors the 5-minute timeout configured on the backend.
export const UPLOAD_TIMEOUT_MS = 5 * 60 * 1000;

// Attach JWT to every request
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auto-logout on 401 (expired/invalid token)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
    }
    return Promise.reject(error);
  }
);
