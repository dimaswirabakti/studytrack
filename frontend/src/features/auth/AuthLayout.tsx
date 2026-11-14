import type { ReactNode } from "react";
import { Wordmark } from "../../components/AppShell";

interface AuthLayoutProps {
  title: string;
  description: string;
  children: ReactNode;
  footer: ReactNode;
}

export function AuthLayout({ title, description, children, footer }: AuthLayoutProps) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <Wordmark />
        <h1 className="mt-10 text-2xl font-semibold tracking-tight">{title}</h1>
        <p className="mt-1.5 text-sm text-zinc-600 dark:text-zinc-400">{description}</p>
        <div className="mt-8">{children}</div>
        <p className="mt-8 text-sm text-zinc-600 dark:text-zinc-400">{footer}</p>
      </div>
    </div>
  );
}

export const textLinkClass =
  "font-medium text-zinc-900 underline decoration-zinc-400 underline-offset-4 hover:decoration-zinc-900 dark:text-zinc-100 dark:hover:decoration-zinc-100";
