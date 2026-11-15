import { describe, expect, it } from "vitest";
import { categorizeTask, categorizeTasks, DUE_SOON_WINDOW_MS } from "./task-category.js";
import type { TaskTiming } from "./task-category.js";

// contoh data dari dokumen studi kasus dengan deadline dalam wib
const LAB_4: TaskTiming = { id: 1, deadline: "2026-07-03T23:59:00+07:00", status: "belum" };
const PROJECT_3: TaskTiming = { id: 2, deadline: "2026-07-02T10:00:00+07:00", status: "belum" };
const SPRINT_2: TaskTiming = { id: 3, deadline: "2026-07-06T23:59:00+07:00", status: "belum" };
const SAMPLE_TASKS = [LAB_4, PROJECT_3, SPRINT_2];

const at = (iso: string) => new Date(iso);
const shift = (date: Date, ms: number) => new Date(date.getTime() + ms);

describe("categorizeTask", () => {
  it("menandai tugas dengan sisa waktu kurang dari 24 jam sebagai mendekati deadline", () => {
    const now = at("2026-07-02T08:00:00+07:00");
    expect(categorizeTask(PROJECT_3, now)).toBe("mendekati_deadline");
  });

  it("menandai tugas yang sudah lewat deadline sebagai terlambat", () => {
    const now = at("2026-07-03T00:00:00+07:00");
    expect(categorizeTask(PROJECT_3, now)).toBe("terlambat");
  });

  it("menandai tugas dengan sisa waktu lebih dari 24 jam sebagai normal", () => {
    const now = at("2026-07-02T08:00:00+07:00");
    expect(categorizeTask(LAB_4, now)).toBe("normal");
  });

  it("tidak menandai tugas selesai walaupun deadline kurang dari 24 jam", () => {
    const now = at("2026-07-02T08:00:00+07:00");
    expect(categorizeTask({ ...PROJECT_3, status: "selesai" }, now)).toBe("selesai");
  });

  it("tidak menandai tugas selesai walaupun deadline sudah lewat", () => {
    const now = at("2026-07-10T00:00:00+07:00");
    expect(categorizeTask({ ...SPRINT_2, status: "selesai" }, now)).toBe("selesai");
  });

  describe("batas waktu", () => {
    const deadline = at(PROJECT_3.deadline);

    it("sisa tepat 24 jam masih normal karena syaratnya kurang dari 24 jam", () => {
      expect(categorizeTask(PROJECT_3, shift(deadline, -DUE_SOON_WINDOW_MS))).toBe("normal");
    });

    it("sisa 24 jam kurang 1 milidetik sudah mendekati deadline", () => {
      expect(categorizeTask(PROJECT_3, shift(deadline, -DUE_SOON_WINDOW_MS + 1))).toBe(
        "mendekati_deadline",
      );
    });

    it("tepat di detik deadline belum terlambat", () => {
      expect(categorizeTask(PROJECT_3, deadline)).toBe("mendekati_deadline");
    });

    it("1 milidetik setelah deadline sudah terlambat", () => {
      expect(categorizeTask(PROJECT_3, shift(deadline, 1))).toBe("terlambat");
    });
  });

  it("hasilnya sama untuk waktu yang sama walau ditulis dengan zona waktu berbeda", () => {
    const now = at("2026-07-03T00:00:00+07:00");
    const sameDeadlineInUtc = { ...LAB_4, deadline: "2026-07-03T16:59:00Z" };
    expect(categorizeTask(sameDeadlineInUtc, now)).toBe(categorizeTask(LAB_4, now));
    expect(categorizeTask(sameDeadlineInUtc, now)).toBe("mendekati_deadline");
  });
});

describe("categorizeTasks", () => {
  it("menaruh tugas mendekati deadline paling atas", () => {
    const result = categorizeTasks(SAMPLE_TASKS, at("2026-07-02T08:00:00+07:00"));
    expect(result.map((task) => [task.id, task.kategori])).toEqual([
      [2, "mendekati_deadline"],
      [1, "normal"],
      [3, "normal"],
    ]);
  });

  it("menaruh tugas terlambat setelah mendekati deadline dan sebelum normal", () => {
    const result = categorizeTasks(SAMPLE_TASKS, at("2026-07-03T00:00:00+07:00"));
    expect(result.map((task) => [task.id, task.kategori])).toEqual([
      [1, "mendekati_deadline"],
      [2, "terlambat"],
      [3, "normal"],
    ]);
  });

  it("menaruh tugas selesai paling bawah", () => {
    const tasks = [{ ...PROJECT_3, status: "selesai" as const }, LAB_4, SPRINT_2];
    const result = categorizeTasks(tasks, at("2026-07-02T08:00:00+07:00"));
    expect(result.map((task) => task.id)).toEqual([1, 3, 2]);
    expect(result.at(-1)?.kategori).toBe("selesai");
  });

  it("mengurutkan tugas terlambat dari yang paling baru lewat", () => {
    const result = categorizeTasks(SAMPLE_TASKS, at("2026-07-10T00:00:00+07:00"));
    expect(result.map((task) => task.id)).toEqual([3, 1, 2]);
    expect(result.every((task) => task.kategori === "terlambat")).toBe(true);
  });

  it("menghitung sisa waktu dalam milidetik dan bernilai negatif setelah deadline", () => {
    const [project3] = categorizeTasks([PROJECT_3], at("2026-07-02T08:00:00+07:00"));
    expect(project3?.sisa_ms).toBe(2 * 60 * 60 * 1000);
    const [late] = categorizeTasks([PROJECT_3], at("2026-07-02T11:00:00+07:00"));
    expect(late?.sisa_ms).toBe(-60 * 60 * 1000);
  });

  it("berlaku untuk semua tugas lintas mata kuliah dan tidak mengubah array asli", () => {
    const input = [...SAMPLE_TASKS];
    const result = categorizeTasks(input, at("2026-07-02T08:00:00+07:00"));
    expect(result).toHaveLength(3);
    expect(input).toEqual(SAMPLE_TASKS);
  });

  it("mengembalikan array kosong untuk user tanpa tugas", () => {
    expect(categorizeTasks([], new Date())).toEqual([]);
  });
});
