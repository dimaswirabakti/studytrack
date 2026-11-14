import { pool } from "../db/pool.js";

export interface Course {
  id: number;
  user_id: number;
  name: string;
  kode: string;
  dosen: string;
}

export interface CourseInput {
  name: string;
  kode: string;
  dosen: string;
}

const COURSE_COLUMNS = "id, user_id, name, kode, dosen";

export async function listCourses(userId: number): Promise<Course[]> {
  const { rows } = await pool.query<Course>(
    `select ${COURSE_COLUMNS} from courses where user_id = $1 order by id`,
    [userId],
  );
  return rows;
}

export async function createCourse(userId: number, input: CourseInput): Promise<Course> {
  const { rows } = await pool.query<Course>(
    `insert into courses (user_id, name, kode, dosen) values ($1, $2, $3, $4)
     returning ${COURSE_COLUMNS}`,
    [userId, input.name, input.kode, input.dosen],
  );
  return rows[0]!;
}

// field yang tidak dikirim bernilai null sehingga coalesce mempertahankan nilai lama
export async function updateCourse(
  userId: number,
  id: number,
  patch: Partial<CourseInput>,
): Promise<Course | undefined> {
  const { rows } = await pool.query<Course>(
    `update courses
     set name = coalesce($3, name), kode = coalesce($4, kode), dosen = coalesce($5, dosen)
     where id = $1 and user_id = $2
     returning ${COURSE_COLUMNS}`,
    [id, userId, patch.name ?? null, patch.kode ?? null, patch.dosen ?? null],
  );
  return rows[0];
}

// tugas di dalam mata kuliah ikut terhapus lewat on delete cascade
export async function deleteCourse(userId: number, id: number): Promise<boolean> {
  const { rowCount } = await pool.query("delete from courses where id = $1 and user_id = $2", [
    id,
    userId,
  ]);
  return rowCount === 1;
}
