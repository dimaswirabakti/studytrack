import { ArrowClockwiseIcon, CaretDownIcon, PlusIcon } from "@phosphor-icons/react";
import { useState } from "react";
import { Alert, Button } from "../../components/ui";
import { formatMonth } from "../../lib/date";
import type { Task } from "../../lib/types";
import { useNow } from "../../lib/useNow";
import { useCourses } from "../courses/useCourses";
import { AgendaSkeleton, TaskAgenda } from "./TaskAgenda";
import { TaskComposer } from "./TaskComposer";
import { TaskRow } from "./TaskRow";
import { useTasks } from "./useTasks";

const COMPOSER_ID = "task-composer";

function byDeadline(a: Task, b: Task): number {
  return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
}

// tampilan kosong memakai gutter tanggal hari ini supaya tetap terasa seperti agenda
function EmptyAgenda({ onCreate }: { onCreate: () => void }) {
  const now = useNow();
  return (
    <div className="grid grid-cols-[3rem_minmax(0,1fr)] gap-x-4 sm:grid-cols-[5.5rem_minmax(0,1fr)] sm:gap-x-8">
      <div className="text-right text-zinc-300 dark:text-zinc-700" aria-hidden>
        <p className="text-4xl leading-none font-semibold tracking-tighter tabular-nums sm:text-6xl">
          {now.getDate()}
        </p>
        <p className="mt-1.5 text-xs font-medium tracking-wider uppercase">{formatMonth(now)}</p>
      </div>
      <div className="border-t border-zinc-300 pt-4 dark:border-zinc-700">
        <p className="font-semibold">Agenda masih kosong</p>
        <p className="mt-1 max-w-md text-sm text-zinc-600 dark:text-zinc-400">
          Tambahkan tugas pertamamu. StudyTrack menyusunnya per tanggal deadline.
        </p>
        <Button onClick={onCreate} className="mt-5">
          <PlusIcon size={18} weight="bold" aria-hidden />
          Tambah tugas
        </Button>
      </div>
    </div>
  );
}

function DoneSection({ tasks }: { tasks: Task[] }) {
  if (tasks.length === 0) {
    return null;
  }
  return (
    <details className="group mt-14 border-t border-zinc-300 pt-4 dark:border-zinc-700">
      <summary className="flex w-fit cursor-pointer list-none items-center gap-2 rounded-md text-sm font-medium text-zinc-600 hover:text-zinc-900 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 [&::-webkit-details-marker]:hidden">
        <CaretDownIcon
          size={16}
          className="transition-transform duration-200 group-open:rotate-180"
          aria-hidden
        />
        Selesai ({tasks.length})
      </summary>
      <ul className="mt-2 divide-y divide-zinc-200 dark:divide-zinc-800">
        {tasks.map((task) => (
          <TaskRow key={task.id} task={task} showDate />
        ))}
      </ul>
    </details>
  );
}

export default function TasksPage() {
  const tasksQuery = useTasks();
  const coursesQuery = useCourses();
  const [composerOpen, setComposerOpen] = useState(false);

  const tasks = tasksQuery.data ?? [];
  const pending = tasks.filter((task) => task.status === "belum").sort(byDeadline);
  const done = tasks.filter((task) => task.status === "selesai").sort(byDeadline);

  function renderContent() {
    if (tasksQuery.isPending) {
      return <AgendaSkeleton />;
    }
    if (tasksQuery.isError) {
      return (
        <Alert
          action={
            <Button
              variant="ghost"
              onClick={() => void tasksQuery.refetch()}
              className="-my-1.5 h-8 px-2"
            >
              <ArrowClockwiseIcon size={16} aria-hidden />
              Coba lagi
            </Button>
          }
        >
          Daftar tugas gagal dimuat.
        </Alert>
      );
    }
    if (tasks.length === 0) {
      return <EmptyAgenda onCreate={() => setComposerOpen(true)} />;
    }
    return (
      <>
        {pending.length > 0 ? (
          <TaskAgenda tasks={pending} />
        ) : (
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Semua tugas sudah selesai. Tugas baru akan muncul di agenda ini.
          </p>
        )}
        <DoneSection tasks={done} />
      </>
    );
  }

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Tugas</h1>
          {tasksQuery.isSuccess && (
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              {pending.length} belum selesai, {done.length} selesai
            </p>
          )}
        </div>
        <Button
          onClick={() => setComposerOpen((open) => !open)}
          aria-expanded={composerOpen}
          aria-controls={COMPOSER_ID}
        >
          <PlusIcon size={18} weight="bold" aria-hidden />
          Tugas baru
        </Button>
      </div>
      {composerOpen && (
        <TaskComposer
          id={COMPOSER_ID}
          courses={coursesQuery.data ?? []}
          onClose={() => setComposerOpen(false)}
        />
      )}
      <div className="mt-12">{renderContent()}</div>
    </>
  );
}
