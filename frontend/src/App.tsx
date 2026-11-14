import { CircleNotchIcon } from "@phosphor-icons/react";
import { Link, Navigate, Outlet, Route, Routes } from "react-router";
import { useAuth } from "./auth/AuthContext";
import { AppShell } from "./components/AppShell";
import LoginPage from "./features/auth/LoginPage";
import RegisterPage from "./features/auth/RegisterPage";
import CoursesPage from "./features/courses/CoursesPage";
import TasksPage from "./features/tasks/TasksPage";

function FullPageLoader() {
  return (
    <div className="flex min-h-dvh items-center justify-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
      <CircleNotchIcon size={18} className="motion-safe:animate-spin" aria-hidden />
      Memuat StudyTrack
    </div>
  );
}

// halaman yang butuh login dibungkus app shell, pengguna tanpa sesi diarahkan ke login
function RequireAuth() {
  const { user, isLoading } = useAuth();
  if (isLoading) {
    return <FullPageLoader />;
  }
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return (
    <AppShell>
      <Outlet />
    </AppShell>
  );
}

// halaman login dan daftar tidak perlu dibuka lagi setelah masuk
function GuestOnly() {
  const { user, isLoading } = useAuth();
  if (isLoading) {
    return <FullPageLoader />;
  }
  if (user) {
    return <Navigate to="/tasks" replace />;
  }
  return <Outlet />;
}

function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-3 px-4 text-center">
      <p className="font-mono text-sm text-zinc-500">404</p>
      <h1 className="text-2xl font-semibold tracking-tight">Halaman tidak ditemukan</h1>
      <Link to="/tasks" className="text-sm font-medium underline underline-offset-4">
        Kembali ke daftar tugas
      </Link>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route element={<GuestOnly />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>
      <Route element={<RequireAuth />}>
        <Route path="/tasks" element={<TasksPage />} />
        <Route path="/courses" element={<CoursesPage />} />
      </Route>
      <Route path="/" element={<Navigate to="/tasks" replace />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
