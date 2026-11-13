import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api.js";
import { useAuth } from "../AuthContext.jsx";

/** Halaman login. Field sudah terisi akun demo agar mudah dicoba. */
export default function Login() {
  const [email, setEmail] = useState("demo@studytrack.test");
  const [password, setPassword] = useState("demo1234");
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    try {
      const res = await api.post("/auth/login", { email, password });
      login(res.data.token, res.data.user);
      navigate("/tasks");
    } catch (err) {
      setError(err.response?.data?.error || "Gagal login.");
    }
  }

  return (
    <div className="container auth-page">
      <div className="card">
        <h2>Login ke StudyTrack</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {error && <p className="error">{error}</p>}
          <button type="submit">Login</button>
        </form>
        <p className="muted-link">
          Belum punya akun? <Link to="/register">Daftar di sini</Link>
        </p>
        <p className="muted-link">
          Akun demo sudah terisi otomatis (demo@studytrack.test / demo1234).
        </p>
      </div>
    </div>
  );
}
