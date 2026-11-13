import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext.jsx";

/** Bilah navigasi atas. Menampilkan menu sesuai status login. */
export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <div className="navbar">
      <Link to="/" className="brand">StudyTrack</Link>
      <nav>
        {user ? (
          <>
            <Link to="/courses">Mata Kuliah</Link>
            <Link to="/tasks">Daftar Tugas</Link>
            <span>{user.nama}</span>
            <button onClick={handleLogout}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Daftar</Link>
          </>
        )}
      </nav>
    </div>
  );
}
