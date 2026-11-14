import bcrypt from "bcryptjs";
import { pool } from "./pool.js";

// data awal sama dengan contoh data pada dokumen studi kasus
const DEMO_USER = {
  nama: "Demo Mahasiswa",
  email: "demo@studytrack.test",
  password: "demo1234",
};

const DEMO_COURSES = [
  { name: "Database Systems", kode: "CS 186", dosen: "Dr. Andi Wijaya" },
  { name: "Data Structures", kode: "CS 61B", dosen: "Dr. Sari Lestari" },
  { name: "Software Engineering", kode: "CS 169", dosen: "Dr. Budi Santoso" },
];

const DEMO_TASKS = [
  {
    courseIndex: 0,
    judul: "Lab 4: Query Optimization Report",
    deskripsi: "Laporan hasil eksperimen optimasi query beserta analisis query plan.",
    deadline: "2026-07-03T23:59:00",
    createdAt: "2026-06-15T09:00:00+07:00",
  },
  {
    courseIndex: 1,
    judul: "Project 3: BSTMap Implementation",
    deskripsi: "Implementasi BSTMap beserta pengujian dasarnya.",
    deadline: "2026-07-02T10:00:00",
    createdAt: "2026-06-16T14:00:00+07:00",
  },
  {
    courseIndex: 2,
    judul: "Sprint 2: Backend API Integration",
    deskripsi: "Integrasi endpoint backend ke frontend untuk sprint 2.",
    deadline: "2026-07-06T23:59:00",
    createdAt: "2026-06-17T11:00:00+07:00",
  },
];

// menghapus seluruh data lalu mengisi ulang dengan data seed
export async function resetDatabase(): Promise<void> {
  const passwordHash = await bcrypt.hash(DEMO_USER.password, 10);
  const client = await pool.connect();

  try {
    await client.query("begin");
    await client.query("truncate table tasks, courses, users restart identity cascade");

    const { rows: users } = await client.query<{ id: number }>(
      "insert into users (nama, email, password_hash) values ($1, $2, $3) returning id",
      [DEMO_USER.nama, DEMO_USER.email, passwordHash],
    );
    const userId = users[0]!.id;

    const courseIds: number[] = [];
    for (const course of DEMO_COURSES) {
      const { rows } = await client.query<{ id: number }>(
        "insert into courses (user_id, name, kode, dosen) values ($1, $2, $3, $4) returning id",
        [userId, course.name, course.kode, course.dosen],
      );
      courseIds.push(rows[0]!.id);
    }

    for (const task of DEMO_TASKS) {
      await client.query(
        `insert into tasks (user_id, mata_kuliah_id, judul, deskripsi, deadline, created_at)
         values ($1, $2, $3, $4, $5, $6)`,
        [
          userId,
          courseIds[task.courseIndex],
          task.judul,
          task.deskripsi,
          task.deadline,
          task.createdAt,
        ],
      );
    }

    await client.query("commit");
  } catch (error) {
    await client.query("rollback");
    throw error;
  } finally {
    client.release();
  }
}
