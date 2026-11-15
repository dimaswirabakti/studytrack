import type { TaskStatus } from "../repositories/task-repository.js";

// batas mendekati deadline bersifat tetap untuk versi ini sesuai catatan kebutuhan
export const DUE_SOON_WINDOW_MS = 24 * 60 * 60 * 1000;

export type TaskCategory = "mendekati_deadline" | "terlambat" | "normal" | "selesai";

export interface TaskTiming {
  id: number;
  deadline: string;
  status: TaskStatus;
}

export type CategorizedTask<T extends TaskTiming> = T & {
  kategori: TaskCategory;
  sisa_ms: number;
};

// tugas selesai tidak perlu diingatkan sehingga statusnya mengalahkan perhitungan waktu
export function categorizeTask(
  task: Pick<TaskTiming, "deadline" | "status">,
  now: Date,
): TaskCategory {
  if (task.status === "selesai") {
    return "selesai";
  }
  const remainingMs = new Date(task.deadline).getTime() - now.getTime();
  if (remainingMs < 0) {
    return "terlambat";
  }
  if (remainingMs < DUE_SOON_WINDOW_MS) {
    return "mendekati_deadline";
  }
  return "normal";
}

export function withCategory<T extends TaskTiming>(task: T, now: Date): CategorizedTask<T> {
  return {
    ...task,
    kategori: categorizeTask(task, now),
    sisa_ms: new Date(task.deadline).getTime() - now.getTime(),
  };
}

// urutan bagian di daftar tugas, mendekati deadline selalu paling atas
const CATEGORY_ORDER: Record<TaskCategory, number> = {
  mendekati_deadline: 0,
  terlambat: 1,
  normal: 2,
  selesai: 3,
};

// bagian mendekati dan normal diurutkan dari deadline terdekat, terlambat dan selesai dari yang paling baru
const DEADLINE_DIRECTION: Record<TaskCategory, 1 | -1> = {
  mendekati_deadline: 1,
  terlambat: -1,
  normal: 1,
  selesai: -1,
};

function compareForList<T extends TaskTiming>(
  a: CategorizedTask<T>,
  b: CategorizedTask<T>,
): number {
  const byCategory = CATEGORY_ORDER[a.kategori] - CATEGORY_ORDER[b.kategori];
  if (byCategory !== 0) {
    return byCategory;
  }
  const byDeadline = (a.sisa_ms - b.sisa_ms) * DEADLINE_DIRECTION[a.kategori];
  if (byDeadline !== 0) {
    return byDeadline;
  }
  return a.id - b.id;
}

// menambahkan kategori ke setiap tugas lalu mengurutkannya untuk halaman daftar tugas
export function categorizeTasks<T extends TaskTiming>(tasks: T[], now: Date): CategorizedTask<T>[] {
  return tasks.map((task) => withCategory(task, now)).sort(compareForList);
}
