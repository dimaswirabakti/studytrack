import { CheckCircleIcon, CircleIcon } from "@phosphor-icons/react";
import { ConfirmDeleteButton } from "../../components/ConfirmDeleteButton";
import { IconButton } from "../../components/ui";
import { formatShortDate, formatTime } from "../../lib/date";
import type { Task } from "../../lib/types";
import { DeadlineBadge } from "./DeadlineBadge";
import { useDeleteTask, useSetTaskStatus } from "./useTasks";

interface TaskRowProps {
  task: Task;
  elapsedMs: number;
  showDate?: boolean;
}

export function TaskRow({ task, elapsedMs, showDate = false }: TaskRowProps) {
  const setStatus = useSetTaskStatus();
  const deleteTask = useDeleteTask();
  const deadline = new Date(task.deadline);
  const done = task.status === "selesai";
  const busy = setStatus.isPending || deleteTask.isPending;
  // sisa waktu dari server dikurangi waktu yang sudah berjalan sejak data diambil
  const remainingMs = task.sisa_ms - elapsedMs;

  return (
    <li className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-x-3 py-3.5 sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:gap-x-5">
      <time
        dateTime={task.deadline}
        className="hidden w-12 pt-0.5 font-mono text-sm text-zinc-500 tabular-nums sm:block dark:text-zinc-400"
      >
        {formatTime(deadline)}
      </time>
      <div className="min-w-0">
        <p
          className={`leading-snug font-medium break-words ${
            done ? "text-zinc-500 line-through decoration-zinc-400 dark:text-zinc-500" : ""
          }`}
        >
          {task.judul}
        </p>
        <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-zinc-600 dark:text-zinc-400">
          <span>
            <span className="font-mono text-zinc-500 tabular-nums sm:hidden">
              {formatTime(deadline)}{" "}
            </span>
            {task.mata_kuliah}
            {showDate && <span className="text-zinc-500">, {formatShortDate(deadline)}</span>}
          </span>
          <DeadlineBadge category={task.kategori} remainingMs={remainingMs} />
        </div>
        {task.deskripsi && (
          <p className="mt-1 line-clamp-2 max-w-prose text-sm text-zinc-500 dark:text-zinc-400">
            {task.deskripsi}
          </p>
        )}
        {(setStatus.isError || deleteTask.isError) && (
          <p role="alert" className="mt-1 text-sm text-red-700 dark:text-red-300">
            Perubahan gagal disimpan. Coba lagi.
          </p>
        )}
      </div>
      <div className="flex items-center gap-0.5">
        <IconButton
          label={done ? "Tandai belum selesai" : "Tandai selesai"}
          aria-pressed={done}
          disabled={busy}
          onClick={() => setStatus.mutate({ id: task.id, status: done ? "belum" : "selesai" })}
          className={done ? "text-zinc-900 dark:text-zinc-100" : ""}
        >
          {done ? <CheckCircleIcon size={20} weight="fill" /> : <CircleIcon size={20} />}
        </IconButton>
        <ConfirmDeleteButton
          label={`Hapus tugas ${task.judul}`}
          disabled={busy}
          onConfirm={() => deleteTask.mutate(task.id)}
        />
      </div>
    </li>
  );
}
