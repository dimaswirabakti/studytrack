import bcrypt from "bcryptjs";
import type { PoolClient } from "pg";
import { pool } from "./pool.js";

// data awal sama dengan contoh data pada dokumen studi kasus
export const DEMO_USER = {
  nama: "Demo Mahasiswa",
  email: "demo@studytrack.test",
  password: "demo1234",
};

const DEMO_COURSES = [
  { name: "Database Systems", kode: "CS 186", dosen: "Dr. Andi Wijaya" },
  { name: "Data Structures", kode: "CS 61B", dosen: "Dr. Sari Lestari" },
  { name: "Software Engineering", kode: "CS 169", dosen: "Dr. Budi Santoso" },
];

const HOUR_MS = 60 * 60 * 1000;

interface SeedTask {
  courseIndex: number;
  judul: string;
  deskripsi: string;
  deadline: string;
  createdAt: string;
  status?: "belum" | "selesai";
}

// tiga tugas pertama sama persis dengan contoh data pada dokumen studi kasus
const SAMPLE_TASKS: SeedTask[] = [
  {
    courseIndex: 0,
    judul: "Lab 4: Query Optimization Report",
    deskripsi: "Laporan hasil eksperimen optimasi query beserta analisis query plan.",
    deadline: "2026-07-03T23:59:00+07:00",
    createdAt: "2026-06-15T09:00:00+07:00",
  },
  {
    courseIndex: 1,
    judul: "Project 3: BSTMap Implementation",
    deskripsi: "Implementasi BSTMap beserta pengujian dasarnya.",
    deadline: "2026-07-02T10:00:00+07:00",
    createdAt: "2026-06-16T14:00:00+07:00",
  },
  {
    courseIndex: 2,
    judul: "Sprint 2: Backend API Integration",
    deskripsi: "Integrasi endpoint backend ke frontend untuk sprint 2.",
    deadline: "2026-07-06T23:59:00+07:00",
    createdAt: "2026-06-17T11:00:00+07:00",
  },
];

// tugas demo dihitung dari waktu seed supaya semua kategori langsung terlihat saat aplikasi dibuka
function demoTasks(now: Date): SeedTask[] {
  const fromNow = (hours: number) => new Date(now.getTime() + hours * HOUR_MS).toISOString();
  const createdAt = fromNow(-72);
  return [
    {
      courseIndex: 1,
      judul: "Kuis Pohon AVL",
      deskripsi: "Latihan soal rotasi kiri dan kanan sebelum kuis.",
      deadline: fromNow(3),
      createdAt,
    },
    {
      courseIndex: 0,
      judul: "Tugas Normalisasi 3NF",
      deskripsi: "Normalisasi skema perpustakaan sampai bentuk normal ketiga.",
      deadline: fromNow(20),
      createdAt,
    },
    {
      courseIndex: 2,
      judul: "Review Pull Request Sprint 3",
      deskripsi: "Review dua pull request tim dan beri komentar.",
      deadline: fromNow(52),
      createdAt,
    },
    {
      courseIndex: 0,
      judul: "Proposal Basis Data Proyek Akhir",
      deskripsi: "",
      deadline: fromNow(140),
      createdAt,
    },
    {
      courseIndex: 2,
      judul: "Ringkasan Materi Testing",
      deskripsi: "Rangkuman unit test dan integration test minggu ini.",
      deadline: fromNow(-30),
      createdAt,
      status: "selesai",
    },
  ];
}

// mengisi mata kuliah dan tugas demo milik satu user, deadline relatif dihitung dari now
async function insertDemoContent(client: PoolClient, userId: number, now: Date): Promise<void> {
  const courseIds: number[] = [];
  for (const course of DEMO_COURSES) {
    const { rows } = await client.query<{ id: number }>(
      "insert into courses (user_id, name, kode, dosen) values ($1, $2, $3, $4) returning id",
      [userId, course.name, course.kode, course.dosen],
    );
    courseIds.push(rows[0]!.id);
  }

  for (const task of [...SAMPLE_TASKS, ...demoTasks(now)]) {
    await client.query(
      `insert into tasks (user_id, mata_kuliah_id, judul, deskripsi, deadline, created_at, status)
       values ($1, $2, $3, $4, $5, $6, $7)`,
      [
        userId,
        courseIds[task.courseIndex],
        task.judul,
        task.deskripsi,
        task.deadline,
        task.createdAt,
        task.status ?? "belum",
      ],
    );
  }
}

async function inTransaction(work: (client: PoolClient) => Promise<void>): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query("begin");
    await work(client);
    await client.query("commit");
  } catch (error) {
    await client.query("rollback");
    throw error;
  } finally {
    client.release();
  }
}

export function isDemoEmail(email: string): boolean {
  return email.trim().toLowerCase() === DEMO_USER.email;
}

// menghapus seluruh data lalu mengisi ulang dengan data seed
export async function resetDatabase(): Promise<void> {
  const passwordHash = await bcrypt.hash(DEMO_USER.password, 10);

  await inTransaction(async (client) => {
    await client.query("truncate table tasks, courses, users restart identity cascade");
    const { rows } = await client.query<{ id: number }>(
      "insert into users (nama, email, password_hash) values ($1, $2, $3) returning id",
      [DEMO_USER.nama, DEMO_USER.email, passwordHash],
    );
    await insertDemoContent(client, rows[0]!.id, new Date());
  });
}

// hanya data milik akun demo yang diganti, akun lain di database tidak tersentuh
export async function refreshDemoData(userId: number, now = new Date()): Promise<void> {
  await inTransaction(async (client) => {
    // tasks dan task_plans ikut terhapus lewat on delete cascade
    await client.query("delete from courses where user_id = $1", [userId]);
    await insertDemoContent(client, userId, now);
  });
}

// membuat akun demo kalau belum ada lalu menyegarkan datanya, dipakai script db:reset-demo
export async function ensureDemoAccount(): Promise<number> {
  const existing = await pool.query<{ id: number }>(
    "select id from users where lower(email) = $1",
    [DEMO_USER.email],
  );
  let userId = existing.rows[0]?.id;

  if (userId === undefined) {
    const passwordHash = await bcrypt.hash(DEMO_USER.password, 10);
    const { rows } = await pool.query<{ id: number }>(
      "insert into users (nama, email, password_hash) values ($1, $2, $3) returning id",
      [DEMO_USER.nama, DEMO_USER.email, passwordHash],
    );
    userId = rows[0]!.id;
  }

  await refreshDemoData(userId);
  return userId;
}
