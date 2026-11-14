import { Router } from "express";
import { z } from "zod";
import { HttpError } from "../lib/http-error.js";
import { parseId, parseOrThrow } from "../lib/validation.js";
import { currentUser, requireAuth } from "../middleware/auth.js";
import {
  createCourse,
  deleteCourse,
  listCourses,
  updateCourse,
} from "../repositories/course-repository.js";

const router = Router();
const NOT_FOUND = "Mata kuliah tidak ditemukan.";
const NAME_REQUIRED = "Nama mata kuliah wajib diisi.";

const createCourseSchema = z.object({
  name: z.string({ error: NAME_REQUIRED }).trim().min(1, NAME_REQUIRED),
  kode: z.string().trim().default(""),
  dosen: z.string().trim().default(""),
});

const updateCourseSchema = z.object({
  name: z.string().trim().min(1, NAME_REQUIRED).optional(),
  kode: z.string().trim().optional(),
  dosen: z.string().trim().optional(),
});

// seluruh endpoint mata kuliah membutuhkan login
router.use(requireAuth);

// get /api/courses daftar mata kuliah milik user
router.get("/", async (req, res) => {
  const courses = await listCourses(currentUser(req).id);
  res.json({ courses });
});

// post /api/courses menambahkan mata kuliah baru
router.post("/", async (req, res) => {
  const input = parseOrThrow(createCourseSchema, req.body);
  const course = await createCourse(currentUser(req).id, input);
  res.status(201).json({ course });
});

// put /api/courses/{id} memperbarui field yang dikirim saja
router.put("/:id", async (req, res) => {
  const id = parseId(req.params.id, NOT_FOUND);
  const patch = parseOrThrow(updateCourseSchema, req.body ?? {});
  const course = await updateCourse(currentUser(req).id, id, patch);

  if (!course) {
    throw new HttpError(404, NOT_FOUND);
  }
  res.json({ course });
});

// delete /api/courses/{id} menghapus mata kuliah beserta seluruh tugasnya
router.delete("/:id", async (req, res) => {
  const id = parseId(req.params.id, NOT_FOUND);
  const deleted = await deleteCourse(currentUser(req).id, id);

  if (!deleted) {
    throw new HttpError(404, NOT_FOUND);
  }
  res.json({ success: true });
});

export default router;
