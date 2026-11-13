import { Router } from "express";
import { readDB, writeDB } from "../db.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

// Seluruh endpoint mata kuliah membutuhkan login.
router.use(requireAuth);

/**
 * GET /api/courses
 * Daftar mata kuliah milik pengguna yang sedang login.
 *
 * Response : 200 { courses }
 */
router.get("/", (req, res) => {
  const db = readDB();
  const courses = db.courses.filter((c) => c.user_id === req.user.id);
  res.json({ courses });
});

/**
 * POST /api/courses
 * Menambahkan mata kuliah baru.
 *
 * Body     : { name, kode?, dosen? }
 * Response : 201 { course } | 400 name kosong
 */
router.post("/", (req, res) => {
  const { name, kode, dosen } = req.body;
  if (!name) {
    return res.status(400).json({ error: "Nama mata kuliah wajib diisi." });
  }

  const db = readDB();
  const newCourse = {
    id: db.nextIds.course++,
    user_id: req.user.id,
    name,
    kode: kode || "",
    dosen: dosen || ""
  };
  db.courses.push(newCourse);
  writeDB(db);
  res.status(201).json({ course: newCourse });
});

/**
 * PUT /api/courses/:id
 * Memperbarui mata kuliah. Hanya field yang dikirim yang diubah.
 *
 * Body     : { name?, kode?, dosen? }
 * Response : 200 { course } | 404 tidak ditemukan
 */
router.put("/:id", (req, res) => {
  const id = Number(req.params.id);
  const db = readDB();
  const course = db.courses.find((c) => c.id === id && c.user_id === req.user.id);
  if (!course) {
    return res.status(404).json({ error: "Mata kuliah tidak ditemukan." });
  }

  const { name, kode, dosen } = req.body;
  if (name !== undefined) course.name = name;
  if (kode !== undefined) course.kode = kode;
  if (dosen !== undefined) course.dosen = dosen;
  writeDB(db);
  res.json({ course });
});

/**
 * DELETE /api/courses/:id
 * Menghapus mata kuliah beserta seluruh tugas di dalamnya.
 *
 * Response : 200 { success: true } | 404 tidak ditemukan
 */
router.delete("/:id", (req, res) => {
  const id = Number(req.params.id);
  const db = readDB();
  const course = db.courses.find((c) => c.id === id && c.user_id === req.user.id);
  if (!course) {
    return res.status(404).json({ error: "Mata kuliah tidak ditemukan." });
  }

  db.courses = db.courses.filter((c) => c.id !== id);
  db.tasks = db.tasks.filter((t) => t.mata_kuliah_id !== id);
  writeDB(db);
  res.json({ success: true });
});

export default router;
