import { ArrowsClockwiseIcon, CircleNotchIcon, ListChecksIcon } from "@phosphor-icons/react";
import { Alert, Button } from "../../components/ui";
import { getErrorMessage } from "../../lib/api";
import { formatDuration } from "../../lib/deadline";
import type { SavedPlan } from "../../lib/types";
import { useGeneratePlan, useTaskPlan } from "./usePlan";

interface StudyPlanPanelProps {
  id: string;
  taskId: number;
  remainingMs: number;
}

function PlanContent({ saved, remainingMs }: { saved: SavedPlan; remainingMs: number }) {
  const { plan } = saved;
  const totalMinutes = plan.langkah.reduce((sum, step) => sum + step.durasi_menit, 0);
  // peringatan muncul jika total estimasi melebihi sisa waktu yang masih tersedia
  const exceedsDeadline = remainingMs > 0 && totalMinutes * 60_000 > remainingMs;

  return (
    <div className="grid gap-4">
      <p className="text-sm text-zinc-800 dark:text-zinc-200">{plan.ringkasan}</p>
      <ol className="grid gap-2">
        {plan.langkah.map((step, index) => (
          <li
            key={index}
            className="grid grid-cols-[1.5rem_minmax(0,1fr)_auto] items-baseline gap-2 text-sm"
          >
            <span className="font-mono text-zinc-500 tabular-nums">{index + 1}.</span>
            <span>{step.judul}</span>
            <span className="font-mono text-xs whitespace-nowrap text-zinc-500 tabular-nums dark:text-zinc-400">
              {formatDuration(step.durasi_menit)}
            </span>
          </li>
        ))}
      </ol>
      <p className="border-t border-zinc-200 pt-3 text-sm dark:border-zinc-800">
        Total estimasi <span className="font-medium">{formatDuration(totalMinutes)}</span>
        {exceedsDeadline && (
          <span className="text-red-700 dark:text-red-300">, lebih lama dari sisa waktu</span>
        )}
      </p>
      <p className="text-sm text-zinc-600 dark:text-zinc-400">{plan.saran}</p>
    </div>
  );
}

// panel rencana kerja ai yang dibuka dari baris tugas
export function StudyPlanPanel({ id, taskId, remainingMs }: StudyPlanPanelProps) {
  const planQuery = useTaskPlan(taskId, true);
  const generate = useGeneratePlan(taskId);
  const saved = planQuery.data?.plan ?? null;

  function renderBody() {
    if (planQuery.isPending) {
      return (
        <div aria-busy="true" className="grid gap-2">
          <span className="sr-only">Memuat rencana kerja</span>
          <div className="h-3 w-2/3 rounded bg-zinc-200 motion-safe:animate-pulse dark:bg-zinc-800" />
          <div className="h-3 w-1/2 rounded bg-zinc-200 motion-safe:animate-pulse dark:bg-zinc-800" />
        </div>
      );
    }
    if (planQuery.isError) {
      return <Alert>{getErrorMessage(planQuery.error, "Rencana kerja gagal dimuat.")}</Alert>;
    }
    if (!planQuery.data.enabled) {
      return (
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Fitur rencana AI belum diaktifkan di server ini.
        </p>
      );
    }
    if (generate.isPending) {
      return (
        <p className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
          <CircleNotchIcon size={16} className="motion-safe:animate-spin" aria-hidden />
          Menyusun rencana kerja...
        </p>
      );
    }
    if (!saved) {
      return (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="max-w-md text-sm text-zinc-600 dark:text-zinc-400">
            AI akan memecah tugas ini menjadi langkah kerja dengan estimasi waktu yang muat sebelum
            deadline.
          </p>
          <Button onClick={() => generate.mutate()} className="h-9">
            Susun rencana
          </Button>
        </div>
      );
    }
    return <PlanContent saved={saved} remainingMs={remainingMs} />;
  }

  return (
    <div
      id={id}
      aria-live="polite"
      className="col-span-full mt-3 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
    >
      <div className="mb-3 flex items-center gap-2 text-sm font-semibold">
        <ListChecksIcon size={18} weight="bold" aria-hidden />
        Rencana kerja
      </div>
      {renderBody()}
      {generate.isError && (
        <div className="mt-3">
          <Alert>{getErrorMessage(generate.error, "Rencana kerja gagal dibuat. Coba lagi.")}</Alert>
        </div>
      )}
      {saved && !generate.isPending && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-xs text-zinc-500 dark:text-zinc-400">
          <p>Dibuat oleh AI ({saved.model}). Periksa kembali sebelum diikuti.</p>
          <Button variant="ghost" onClick={() => generate.mutate()} className="h-8 px-2 text-xs">
            <ArrowsClockwiseIcon size={14} aria-hidden />
            Susun ulang
          </Button>
        </div>
      )}
    </div>
  );
}
