import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./AuthContext.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Courses from "./pages/Courses.jsx";
import Tasks from "./pages/Tasks.jsx";

/** Membungkus halaman yang hanya boleh diakses setelah login. */
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="container">Memuat...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

/** Daftar route aplikasi. `/` diarahkan ke Daftar Tugas. */
function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="/courses"
        element={
          <ProtectedRoute>
            <Courses />
          </ProtectedRoute>
        }
      />
      <Route
        path="/tasks"
        element={
          <ProtectedRoute>
            <Tasks />
          </ProtectedRoute>
        }
      />
      <Route path="/" element={<Navigate to="/tasks" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}
