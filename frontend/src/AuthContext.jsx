import React, { createContext, useContext, useEffect, useState } from "react";
import api, { TOKEN_KEY } from "./api.js";

const AuthContext = createContext(null);

/**
 * Menyediakan status login ke seluruh aplikasi.
 *
 * Saat pertama dimuat, token yang tersimpan (jika ada) diverifikasi ke
 * `/auth/me`. Selama proses itu `loading` bernilai true.
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      setLoading(false);
      return;
    }
    api
      .get("/auth/me")
      .then((res) => setUser(res.data.user))
      .catch(() => localStorage.removeItem(TOKEN_KEY))
      .finally(() => setLoading(false));
  }, []);

  /** Menyimpan token dan data pengguna setelah login atau registrasi berhasil. */
  function login(token, userData) {
    localStorage.setItem(TOKEN_KEY, token);
    setUser(userData);
  }

  /** Menghapus token dan data pengguna. */
  function logout() {
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

/** Hook untuk mengakses `{ user, loading, login, logout }`. */
export function useAuth() {
  return useContext(AuthContext);
}
