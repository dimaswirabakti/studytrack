import { BooksIcon, CalendarCheckIcon, NotebookIcon, SignOutIcon } from "@phosphor-icons/react";
import type { Icon } from "@phosphor-icons/react";
import type { ReactNode } from "react";
import { Link, NavLink } from "react-router";
import { useAuth } from "../auth/AuthContext";
import { Button } from "./ui";

const NAV_ITEMS: { to: string; label: string; icon: Icon }[] = [
  { to: "/tasks", label: "Tugas", icon: CalendarCheckIcon },
  { to: "/courses", label: "Mata kuliah", icon: BooksIcon },
];

export function Wordmark() {
  return (
    <Link
      to="/tasks"
      className="inline-flex items-center gap-2 rounded-md text-base font-semibold tracking-tight focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-zinc-900 dark:focus-visible:outline-zinc-100"
    >
      <NotebookIcon size={22} weight="duotone" aria-hidden />
      StudyTrack
    </Link>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const { user, signOut } = useAuth();

  return (
    <div className="min-h-dvh">
      <a
        href="#main"
        className="sr-only rounded-md bg-zinc-900 px-3 py-2 text-sm text-white focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50"
      >
        Lewati ke konten
      </a>
      <header className="sticky top-0 z-20 border-b border-zinc-200 bg-zinc-50/85 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/85">
        <div className="mx-auto flex h-14 max-w-5xl items-center gap-4 px-4 sm:gap-8 sm:px-6">
          <Wordmark />
          <nav aria-label="Navigasi utama" className="flex items-center gap-1">
            {NAV_ITEMS.map(({ to, label, icon: ItemIcon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `inline-flex h-9 items-center gap-2 rounded-lg px-3 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900 dark:focus-visible:outline-zinc-100 ${
                    isActive
                      ? "bg-zinc-200/70 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100"
                      : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                  }`
                }
              >
                <ItemIcon size={18} aria-hidden />
                <span className="sr-only sm:not-sr-only">{label}</span>
              </NavLink>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <span className="hidden max-w-40 truncate text-sm text-zinc-600 md:inline dark:text-zinc-400">
              {user?.nama}
            </span>
            <Button variant="ghost" onClick={signOut} aria-label="Keluar" className="px-3">
              <SignOutIcon size={18} aria-hidden />
              <span className="hidden sm:inline">Keluar</span>
            </Button>
          </div>
        </div>
      </header>
      <main id="main" className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
        {children}
      </main>
    </div>
  );
}
