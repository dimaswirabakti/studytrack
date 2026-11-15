import { AlarmIcon, WarningCircleIcon } from "@phosphor-icons/react";
import { formatOverdue, formatRemaining } from "../../lib/deadline";
import type { TaskCategory } from "../../lib/types";

interface DeadlineBadgeProps {
  category: TaskCategory;
  remainingMs: number;
}

const badgeBase =
  "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap ring-1 ring-inset";

// penanda memakai warna, ikon, dan teks sekaligus supaya tidak bergantung pada warna saja
export function DeadlineBadge({ category, remainingMs }: DeadlineBadgeProps) {
  if (category === "mendekati_deadline") {
    return (
      <span
        className={`${badgeBase} bg-amber-100 text-amber-900 ring-amber-300 dark:bg-amber-400/15 dark:text-amber-200 dark:ring-amber-400/30`}
      >
        <AlarmIcon size={14} weight="bold" aria-hidden />
        {formatRemaining(remainingMs)}
      </span>
    );
  }
  if (category === "terlambat") {
    return (
      <span
        className={`${badgeBase} bg-red-50 text-red-800 ring-red-200 dark:bg-red-400/10 dark:text-red-300 dark:ring-red-400/30`}
      >
        <WarningCircleIcon size={14} weight="bold" aria-hidden />
        {formatOverdue(remainingMs)}
      </span>
    );
  }
  return null;
}
