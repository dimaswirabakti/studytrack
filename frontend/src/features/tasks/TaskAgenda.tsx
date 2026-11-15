import { describeDay, formatMonth, groupByDay } from "../../lib/date";
import type { DayGroup } from "../../lib/date";
import type { Task } from "../../lib/types";
import { TaskRow } from "./TaskRow";

// angka tanggal besar di gutter kiri adalah elemen khas tampilan agenda
function DayGutter({ date }: { date: Date }) {
  return (
    <div className="self-start text-right sm:sticky sm:top-20" aria-hidden>
      <p className="text-4xl leading-none font-semibold tracking-tighter tabular-nums sm:text-6xl">
        {date.getDate()}
      </p>
      <p className="mt-1.5 text-xs font-medium tracking-wider text-zinc-500 uppercase dark:text-zinc-400">
        {formatMonth(date)}
      </p>
    </div>
  );
}

interface AgendaDayProps {
  group: DayGroup<Task>;
  now: Date;
  elapsedMs: number;
  idPrefix: string;
}

function AgendaDay({ group, now, elapsedMs, idPrefix }: AgendaDayProps) {
  const { label, detail } = describeDay(group.date, now);
  const headingId = `${idPrefix}-${group.key}`;

  return (
    <li className="grid grid-cols-[3rem_minmax(0,1fr)] gap-x-4 sm:grid-cols-[5.5rem_minmax(0,1fr)] sm:gap-x-8">
      <DayGutter date={group.date} />
      <section aria-labelledby={headingId}>
        <header className="flex flex-wrap items-baseline gap-x-2 border-b border-zinc-300 pb-2 dark:border-zinc-700">
          <h3 id={headingId} className="font-semibold">
            {label}
          </h3>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">{detail}</p>
        </header>
        <ul className="divide-y divide-zinc-200 dark:divide-zinc-800">
          {group.items.map((task) => (
            <TaskRow key={task.id} task={task} elapsedMs={elapsedMs} />
          ))}
        </ul>
      </section>
    </li>
  );
}

interface TaskAgendaProps {
  tasks: Task[];
  now: Date;
  elapsedMs: number;
  idPrefix: string;
}

// urutan tugas mengikuti backend, agenda hanya mengelompokkan tugas berurutan per hari
export function TaskAgenda({ tasks, now, elapsedMs, idPrefix }: TaskAgendaProps) {
  const groups = groupByDay(tasks, (task) => new Date(task.deadline));

  return (
    <ol className="grid gap-10">
      {groups.map((group) => (
        <AgendaDay
          key={group.key}
          group={group}
          now={now}
          elapsedMs={elapsedMs}
          idPrefix={idPrefix}
        />
      ))}
    </ol>
  );
}

export function AgendaSkeleton() {
  return (
    <div aria-busy="true" className="grid gap-12">
      <span className="sr-only">Memuat tugas</span>
      {[0, 1].map((group) => (
        <div
          key={group}
          className="grid grid-cols-[3rem_minmax(0,1fr)] gap-x-4 sm:grid-cols-[5.5rem_minmax(0,1fr)] sm:gap-x-8"
        >
          <div className="ml-auto h-12 w-10 rounded-md bg-zinc-200 motion-safe:animate-pulse sm:h-16 sm:w-16 dark:bg-zinc-800" />
          <div className="grid gap-4">
            <div className="h-5 w-40 rounded bg-zinc-200 motion-safe:animate-pulse dark:bg-zinc-800" />
            {[0, 1].map((row) => (
              <div key={row} className="grid gap-2">
                <div className="h-4 w-3/4 rounded bg-zinc-200 motion-safe:animate-pulse dark:bg-zinc-800" />
                <div className="h-3 w-1/3 rounded bg-zinc-200 motion-safe:animate-pulse dark:bg-zinc-800" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
