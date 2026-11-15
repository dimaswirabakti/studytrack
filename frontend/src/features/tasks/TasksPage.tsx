import {
  AlarmIcon,
  ArrowClockwiseIcon,
  CalendarBlankIcon,
  CaretDownIcon,
  PlusIcon,
  WarningCircleIcon,
} from "@phosphor-icons/react";
import type { Icon } from "@phosphor-icons/react";
import { useState } from "react";
import { Alert, Button } from "../../components/ui";
import { formatMonth } from "../../lib/date";
import type { Task, TaskCategory } from "../../lib/types";
import { useNow } from "../../lib/useNow";
import { useCourses } from "../courses/useCourses";
import { AgendaSkeleton, TaskAgenda } from "./TaskAgenda";
import { TaskComposer } from "./TaskComposer";
import { TaskRow } from "./TaskRow";
import { useTasks } from "./useTasks";

const COMPOSER_ID = "task-composer";

// label sisa waktu diperbarui tiap 30 detik tanpa harus menunggu data baru dari server
const CLOCK_TICK_MS = 30_000;

type SectionTone = "due" | "overdue" | "default";

interface SectionConfig {
  category: TaskCategory;
  title: string;
  description: string;
  icon: Icon;
  tone: SectionTone;
}

const SECTIONS: SectionConfig[] = [
  {
    category: "mendekati_deadline",
    title: "Mendekati deadline",
    description: "Deadline kurang dari 24 jam lagi",
    icon: AlarmIcon,
    tone: "due",
  },
  {
    category: "terlambat",
    title: "Terlambat",
    description: "Sudah melewati deadline",
    icon: WarningCircleIcon,
    tone: "overdue",
  },
  {
    category: "normal",
    title: "Mendatang",
    description: "Deadline lebih dari 24 jam lagi",
    icon: CalendarBlankIcon,
    tone: "default",
  },
];

const SECTION_STYLES: Record<SectionTone, { wrapper: string; heading: string }> = {
  due: {
    wrapper:
      "-mx-2 rounded-2xl bg-amber-50 p-3 ring-1 ring-amber-200 sm:mx-0 sm:p-6 dark:bg-amber-400/5 dark:ring-amber-400/20",
    heading: "text-amber-900 dark:text-amber-200",
  },
  overdue: {
    wrapper: "",
    heading: "text-red-800 dark:text-red-300",
  },
  default: {
    wrapper: "",
    heading: "text-zinc-900 dark:text-zinc-100",
  },
};

interface TaskSectionProps {
  config: SectionConfig;
  tasks: Task[];
  now: Date;
  elapsedMs: number;
}

function TaskSection({ config, tasks, now, elapsedMs }: TaskSectionProps) {
  const styles = SECTION_STYLES[config.tone];
  const headingId = `section-${config.category}`;
  const SectionIcon = config.icon;

  return (
    <section aria-labelledby={headingId} className={styles.wrapper}>
      <header className="mb-6 flex flex-wrap items-center gap-x-3 gap-y-1">
        <h2 id={headingId} className={`flex items-center gap-2 font-semibold ${styles.heading}`}>
          <SectionIcon size={20} weight="bold" aria-hidden />
          {config.title}
          <span className="font-mono text-sm font-normal tabular-nums">({tasks.length})</span>
        </h2>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">{config.description}</p>
      </header>
      <TaskAgenda tasks={tasks} now={now} elapsedMs={elapsedMs} idPrefix={config.category} />
    </section>
  );
}

// tampilan kosong memakai gutter tanggal hari ini supaya tetap terasa seperti agenda
function EmptyAgenda({ now, onCreate }: { now: Date; onCreate: () => void }) {
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

function DoneSection({ tasks, elapsedMs }: { tasks: Task[]; elapsedMs: number }) {
  if (tasks.length === 0) {
    return null;
  }
  return (
    <details className="group border-t border-zinc-300 pt-4 dark:border-zinc-700">
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
          <TaskRow key={task.id} task={task} elapsedMs={elapsedMs} showDate />
        ))}
      </ul>
    </details>
  );
}

export default function TasksPage() {
  const tasksQuery = useTasks();
  const coursesQuery = useCourses();
  const now = useNow(CLOCK_TICK_MS);
  const [composerOpen, setComposerOpen] = useState(false);

  const tasks = tasksQuery.data?.tasks ?? [];
  const elapsedMs = Math.max(0, now.getTime() - tasksQuery.dataUpdatedAt);
  // frontend tidak menghitung ulang kategori, cukup memisahkan sesuai label dari backend
  const byCategory = (category: TaskCategory) => tasks.filter((task) => task.kategori === category);
  const done = byCategory("selesai");
  const pendingCount = tasks.length - done.length;

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
      return <EmptyAgenda now={now} onCreate={() => setComposerOpen(true)} />;
    }
    return (
      <div className="grid gap-14">
        {SECTIONS.map((config) => {
          const sectionTasks = byCategory(config.category);
          return sectionTasks.length > 0 ? (
            <TaskSection
              key={config.category}
              config={config}
              tasks={sectionTasks}
              now={now}
              elapsedMs={elapsedMs}
            />
          ) : null;
        })}
        {pendingCount === 0 && (
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Semua tugas sudah selesai. Tugas baru akan muncul di agenda ini.
          </p>
        )}
        <DoneSection tasks={done} elapsedMs={elapsedMs} />
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Tugas</h1>
          {tasksQuery.isSuccess && (
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              {pendingCount} belum selesai, {done.length} selesai
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
