import axios from "axios";

/** Kunci localStorage tempat token login disimpan. */
export const TOKEN_KEY = "studytrack_token";

/**
 * Instance axios untuk seluruh pemanggilan API backend.
 * Pada mode development, request `/api/*` di-proxy ke backend oleh Vite
 * (lihat `vite.config.js`).
 */
const api = axios.create({
  baseURL: "/api"
});

// Menyisipkan token login ke setiap request jika tersedia.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
