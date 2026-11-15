import { Router } from "express";
import { z } from "zod";
import { isForeignKeyViolation } from "../db/errors.js";
import { categorizeTasks, withCategory } from "../domain/task-category.js";
import { HttpError } from "../lib/http-error.js";
import { parseId, parseOrThrow } from "../lib/validation.js";
import { currentUser, requireAuth } from "../middleware/auth.js";
import {
  createTask,
  deleteTask,
  findTask,
  listTasks,
  updateTask,
} from "../repositories/task-repository.js";

const router = Router();
const NOT_FOUND = "Tugas tidak ditemukan.";
const CREATE_REQUIRED = "mata_kuliah_id, judul, dan deadline wajib diisi.";

// deadline wajib berupa iso 8601 lengkap dengan zona waktu supaya tidak ambigu
const deadlineSchema = z.iso.datetime({
  offset: true,
  error: "Deadline harus berupa tanggal ISO 8601 lengkap dengan zona waktu.",
});

const createTaskSchema = z.object({
  mata_kuliah_id: z.coerce.number({ error: CREATE_REQUIRED }).int().positive(CREATE_REQUIRED),
  judul: z.string({ error: CREATE_REQUIRED }).trim().min(1, CREATE_REQUIRED),
  deskripsi: z.string().trim().default(""),
  deadline: z.string({ error: CREATE_REQUIRED }).pipe(deadlineSchema),
});

const updateTaskSchema = z.object({
  judul: z.string().trim().min(1, "Judul tidak boleh kosong.").optional(),
  deskripsi: z.string().trim().optional(),
  deadline: deadlineSchema.optional(),
  status: z
    .enum(["belum", "selesai"], { error: "Status hanya boleh 'belum' atau 'selesai'." })
    .optional(),
});

// seluruh endpoint tugas membutuhkan login
router.use(requireAuth);

// get /api/tasks daftar seluruh tugas user lintas mata kuliah, sudah dikategorikan dan diurutkan
router.get("/", async (req, res) => {
  const tasks = await listTasks(currentUser(req).id);
  // satu nilai waktu dipakai untuk semua tugas supaya kategorinya konsisten dalam satu respons
  const now = new Date();
  res.json({ tasks: categorizeTasks(tasks, now), server_time: now.toISOString() });
});

// get /api/tasks/{id} detail satu tugas
router.get("/:id", async (req, res) => {
  const id = parseId(req.params.id, NOT_FOUND);
  const task = await findTask(currentUser(req).id, id);

  if (!task) {
    throw new HttpError(404, NOT_FOUND);
  }
  res.json({ task: withCategory(task, new Date()) });
});

// post /api/tasks menambahkan tugas baru dengan status awal belum
router.post("/", async (req, res) => {
  const input = parseOrThrow(createTaskSchema, req.body);

  try {
    const task = await createTask(currentUser(req).id, input);
    res.status(201).json({ task: withCategory(task, new Date()) });
  } catch (error) {
    // foreign key komposit menolak mata kuliah yang bukan milik user
    if (isForeignKeyViolation(error)) {
      throw new HttpError(400, "Mata kuliah tidak ditemukan untuk user ini.");
    }
    throw error;
  }
});

// put /api/tasks/{id} memperbarui field yang dikirim saja termasuk status
router.put("/:id", async (req, res) => {
  const id = parseId(req.params.id, NOT_FOUND);
  const patch = parseOrThrow(updateTaskSchema, req.body ?? {});
  const task = await updateTask(currentUser(req).id, id, patch);

  if (!task) {
    throw new HttpError(404, NOT_FOUND);
  }
  res.json({ task: withCategory(task, new Date()) });
});

// delete /api/tasks/{id} menghapus satu tugas
router.delete("/:id", async (req, res) => {
  const id = parseId(req.params.id, NOT_FOUND);
  const deleted = await deleteTask(currentUser(req).id, id);

  if (!deleted) {
    throw new HttpError(404, NOT_FOUND);
  }
  res.json({ success: true });
});

export default router;
