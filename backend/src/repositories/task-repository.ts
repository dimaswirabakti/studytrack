import { pool } from "../db/pool.js";

export type TaskStatus = "belum" | "selesai";

export interface Task {
  id: number;
  user_id: number;
  mata_kuliah_id: number;
  judul: string;
  deskripsi: string;
  deadline: string;
  status: TaskStatus;
  created_at: string;
}

export interface TaskWithCourse extends Task {
  mata_kuliah: string;
}

export interface CreateTaskInput {
  mata_kuliah_id: number;
  judul: string;
  deskripsi: string;
  deadline: string;
}

export interface UpdateTaskInput {
  judul?: string;
  deskripsi?: string;
  deadline?: string;
  status?: TaskStatus;
}

const TASK_COLUMNS = "id, user_id, mata_kuliah_id, judul, deskripsi, deadline, status, created_at";

// seluruh tugas user lintas mata kuliah, tugas terbaru di atas
export async function listTasks(userId: number): Promise<TaskWithCourse[]> {
  const { rows } = await pool.query<TaskWithCourse>(
    `select t.id, t.user_id, t.mata_kuliah_id, t.judul, t.deskripsi, t.deadline, t.status,
            t.created_at, c.name as mata_kuliah
     from tasks t
     join courses c on c.id = t.mata_kuliah_id
     where t.user_id = $1
     order by t.created_at desc, t.id desc`,
    [userId],
  );
  return rows;
}

export async function findTask(userId: number, id: number): Promise<Task | undefined> {
  const { rows } = await pool.query<Task>(
    `select ${TASK_COLUMNS} from tasks where id = $1 and user_id = $2`,
    [id, userId],
  );
  return rows[0];
}

export async function createTask(userId: number, input: CreateTaskInput): Promise<Task> {
  const { rows } = await pool.query<Task>(
    `insert into tasks (user_id, mata_kuliah_id, judul, deskripsi, deadline)
     values ($1, $2, $3, $4, $5)
     returning ${TASK_COLUMNS}`,
    [userId, input.mata_kuliah_id, input.judul, input.deskripsi, input.deadline],
  );
  return rows[0]!;
}

// field yang tidak dikirim bernilai null sehingga coalesce mempertahankan nilai lama
export async function updateTask(
  userId: number,
  id: number,
  patch: UpdateTaskInput,
): Promise<Task | undefined> {
  const { rows } = await pool.query<Task>(
    `update tasks
     set judul = coalesce($3, judul),
         deskripsi = coalesce($4, deskripsi),
         deadline = coalesce($5, deadline),
         status = coalesce($6::task_status, status)
     where id = $1 and user_id = $2
     returning ${TASK_COLUMNS}`,
    [
      id,
      userId,
      patch.judul ?? null,
      patch.deskripsi ?? null,
      patch.deadline ?? null,
      patch.status ?? null,
    ],
  );
  return rows[0];
}

export async function deleteTask(userId: number, id: number): Promise<boolean> {
  const { rowCount } = await pool.query("delete from tasks where id = $1 and user_id = $2", [
    id,
    userId,
  ]);
  return rowCount === 1;
}
