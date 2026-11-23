import request from "supertest";
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { planGenerator } from "../src/ai/plan-generator.js";
import type { StudyPlan } from "../src/ai/study-plan.js";
import app from "../src/app.js";
import { runMigrations } from "../src/db/migrator.js";
import { pool } from "../src/db/pool.js";
import { refreshDemoData, resetDatabase } from "../src/db/seed.js";

// generator ai diganti versi palsu supaya test tidak memanggil api gemini
vi.mock("../src/ai/plan-generator.js", () => ({
  planGenerator: {
    model: "model-palsu",
    generate: vi.fn((): Promise<StudyPlan> =>
      Promise.resolve({
        ringkasan: "Kerjakan bagian inti dulu.",
        langkah: [
          { judul: "Baca spesifikasi", durasi_menit: 20 },
          { judul: "Implementasi", durasi_menit: 60 },
        ],
        saran: "Mulai sekarang.",
      }),
    ),
  },
}));

// waktu dibekukan supaya kategori dari contoh data dokumen studi kasus selalu sama
const NOW = new Date("2026-07-02T08:00:00+07:00");
const DEMO = { email: "demo@studytrack.test", password: "demo1234" };

interface TaskBody {
  id: number;
  judul: string;
  deadline: string;
  kategori: string;
  sisa_ms: number;
}

async function login(credentials = DEMO): Promise<string> {
  const res = await request(app).post("/api/auth/login").send(credentials);
  return (res.body as { token: string }).token;
}

async function listTasks(token: string): Promise<{ tasks: TaskBody[]; server_time: string }> {
  const res = await request(app).get("/api/tasks").set("Authorization", `Bearer ${token}`);
  expect(res.status).toBe(200);
  return res.body as { tasks: TaskBody[]; server_time: string };
}

describe.runIf(process.env.TEST_DATABASE_URL)("api studytrack", () => {
  beforeAll(async () => {
    await runMigrations();
  });

  beforeEach(async () => {
    vi.useFakeTimers({ toFake: ["Date"], now: NOW });
    await resetDatabase();
  });

  afterAll(async () => {
    vi.useRealTimers();
    await pool.end();
  });

  describe("autentikasi", () => {
    it("menolak password yang salah", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({ ...DEMO, password: "salah" });
      expect(res.status).toBe(401);
      expect(res.body).toEqual({ error: "Email atau password salah." });
    });

    it("menolak akses daftar tugas tanpa token", async () => {
      const res = await request(app).get("/api/tasks");
      expect(res.status).toBe(401);
    });
  });

  describe("daftar tugas dengan penanda deadline", () => {
    it("menaruh tugas mendekati deadline paling atas lalu normal lalu selesai", async () => {
      const { tasks, server_time } = await listTasks(await login());

      expect(server_time).toBe(NOW.toISOString());
      expect(tasks.map((task) => [task.judul, task.kategori])).toEqual([
        ["Project 3: BSTMap Implementation", "mendekati_deadline"],
        ["Kuis Pohon AVL", "mendekati_deadline"],
        ["Tugas Normalisasi 3NF", "mendekati_deadline"],
        ["Lab 4: Query Optimization Report", "normal"],
        ["Review Pull Request Sprint 3", "normal"],
        ["Sprint 2: Backend API Integration", "normal"],
        ["Proposal Basis Data Proyek Akhir", "normal"],
        ["Ringkasan Materi Testing", "selesai"],
      ]);
    });

    it("mengirim deadline sebagai waktu utc dan sisa waktu dalam milidetik", async () => {
      const { tasks } = await listTasks(await login());
      const project3 = tasks.find((task) => task.judul.startsWith("Project 3"));

      expect(project3?.deadline).toBe("2026-07-02T03:00:00.000Z");
      expect(project3?.sisa_ms).toBe(2 * 60 * 60 * 1000);
    });

    it("menandai tugas yang lewat deadline sebagai terlambat setelah waktu berjalan", async () => {
      const token = await login();
      vi.setSystemTime(new Date("2026-07-03T00:00:00+07:00"));
      const { tasks } = await listTasks(token);
      const byTitle = new Map(tasks.map((task) => [task.judul, task.kategori]));

      expect(byTitle.get("Lab 4: Query Optimization Report")).toBe("mendekati_deadline");
      expect(byTitle.get("Project 3: BSTMap Implementation")).toBe("terlambat");
      expect(byTitle.get("Sprint 2: Backend API Integration")).toBe("normal");
    });
  });

  describe("isolasi data antar pengguna", () => {
    it("tidak memperlihatkan atau mengizinkan akses ke tugas milik user lain", async () => {
      const register = await request(app)
        .post("/api/auth/register")
        .send({ nama: "Mahasiswa Baru", email: "baru@studytrack.test", password: "rahasia1" });
      const token = (register.body as { token: string }).token;

      expect((await listTasks(token)).tasks).toEqual([]);

      const detail = await request(app).get("/api/tasks/1").set("Authorization", `Bearer ${token}`);
      expect(detail.status).toBe(404);

      const create = await request(app)
        .post("/api/tasks")
        .set("Authorization", `Bearer ${token}`)
        .send({ mata_kuliah_id: 1, judul: "Numpang", deadline: "2026-07-05T10:00:00+07:00" });
      expect(create.status).toBe(400);
    });
  });

  describe("membuat dan memperbarui tugas", () => {
    it("menolak deadline tanpa zona waktu", async () => {
      const res = await request(app)
        .post("/api/tasks")
        .set("Authorization", `Bearer ${await login()}`)
        .send({ mata_kuliah_id: 1, judul: "Tes", deadline: "2026-07-02T10:00" });
      expect(res.status).toBe(400);
    });

    it("langsung memberi kategori pada tugas baru dan tugas yang ditandai selesai", async () => {
      const token = await login();
      const created = await request(app)
        .post("/api/tasks")
        .set("Authorization", `Bearer ${token}`)
        .send({ mata_kuliah_id: 2, judul: "Kuis dadakan", deadline: "2026-07-02T09:00:00+07:00" });

      expect(created.status).toBe(201);
      const task = (created.body as { task: TaskBody }).task;
      expect(task.kategori).toBe("mendekati_deadline");

      const updated = await request(app)
        .put(`/api/tasks/${task.id}`)
        .set("Authorization", `Bearer ${token}`)
        .send({ status: "selesai" });
      expect((updated.body as { task: TaskBody }).task.kategori).toBe("selesai");
    });
  });

  describe("rencana kerja ai", () => {
    it("menyusun dan menyimpan rencana untuk tugas yang belum selesai", async () => {
      const token = await login();
      const before = await request(app)
        .get("/api/tasks/2/plan")
        .set("Authorization", `Bearer ${token}`);
      expect(before.body).toEqual({ plan: null, enabled: true });

      const created = await request(app)
        .post("/api/tasks/2/plan")
        .set("Authorization", `Bearer ${token}`);
      expect(created.status).toBe(201);
      expect(created.body).toMatchObject({ plan: { model: "model-palsu" } });

      // hanya data tugas yang dikirim ke model, tanpa email pengguna
      const input = vi.mocked(planGenerator!.generate).mock.calls.at(-1)?.[0];
      expect(input).toMatchObject({ judul: "Project 3: BSTMap Implementation" });
      expect(JSON.stringify(input)).not.toContain(DEMO.email);

      const after = await request(app)
        .get("/api/tasks/2/plan")
        .set("Authorization", `Bearer ${token}`);
      expect(after.body).toMatchObject({ plan: { model: "model-palsu" }, enabled: true });
    });

    it("menolak rencana untuk tugas yang sudah selesai", async () => {
      const res = await request(app)
        .post("/api/tasks/8/plan")
        .set("Authorization", `Bearer ${await login()}`);
      expect(res.status).toBe(400);
    });
  });

  describe("penyegaran data demo", () => {
    it("mengembalikan tugas demo relatif terhadap waktu sekarang tanpa menyentuh akun lain", async () => {
      const other = await request(app)
        .post("/api/auth/register")
        .send({ nama: "Ani", email: "ani@studytrack.test", password: "rahasia1" });
      const otherToken = (other.body as { token: string }).token;
      const course = await request(app)
        .post("/api/courses")
        .set("Authorization", `Bearer ${otherToken}`)
        .send({ name: "Kalkulus" });
      expect(course.status).toBe(201);

      // seminggu kemudian tugas relatif sudah basi, lalu data demo disegarkan
      const later = new Date(NOW.getTime() + 7 * 24 * 60 * 60 * 1000);
      vi.setSystemTime(later);
      await refreshDemoData(1, later);

      const { tasks } = await listTasks(await login());
      expect(tasks).toHaveLength(8);
      expect(tasks.find((task) => task.judul === "Kuis Pohon AVL")?.kategori).toBe(
        "mendekati_deadline",
      );

      // token lama sudah kedaluwarsa setelah waktu dimajukan, jadi akun lain login ulang
      const otherCourses = await request(app)
        .get("/api/courses")
        .set(
          "Authorization",
          `Bearer ${await login({ email: "ani@studytrack.test", password: "rahasia1" })}`,
        );
      expect((otherCourses.body as { courses: unknown[] }).courses).toHaveLength(1);
    });
  });

  it("tidak menjalankan ulang migrasi yang sudah diterapkan", async () => {
    expect(await runMigrations()).toEqual([]);
  });
});
