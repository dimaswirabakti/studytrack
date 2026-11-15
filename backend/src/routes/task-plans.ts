import { Router } from "express";
import type { Request } from "express";
import { planGenerator } from "../ai/plan-generator.js";
import { HttpError } from "../lib/http-error.js";
import { parseId } from "../lib/validation.js";
import { currentUser } from "../middleware/auth.js";
import { createRateLimiter } from "../middleware/rate-limit.js";
import { findPlan, savePlan } from "../repositories/plan-repository.js";
import { findTask } from "../repositories/task-repository.js";

// opsi merge params supaya id tugas dari router induk bisa dibaca di sini
const router = Router({ mergeParams: true });
const NOT_FOUND = "Tugas tidak ditemukan.";

// maksimal 5 rencana per user setiap 10 menit untuk menjaga kuota api
const generateLimiter = createRateLimiter({
  limit: 5,
  windowMs: 10 * 60 * 1000,
  message: "Terlalu banyak permintaan rencana. Coba lagi beberapa menit lagi.",
  keyFor: (req) => currentUser(req).id,
});

// get /api/tasks/{id}/plan rencana kerja terakhir yang tersimpan beserta status fitur ai
router.get("/", async (req: Request<{ id: string }>, res) => {
  const user = currentUser(req);
  const taskId = parseId(req.params.id, NOT_FOUND);

  if (!(await findTask(user.id, taskId))) {
    throw new HttpError(404, NOT_FOUND);
  }

  const saved = await findPlan(user.id, taskId);
  res.json({ plan: saved ?? null, enabled: planGenerator !== null });
});

// post /api/tasks/{id}/plan menyusun rencana kerja baru dengan gemini lalu menyimpannya
router.post("/", generateLimiter, async (req: Request<{ id: string }>, res) => {
  if (!planGenerator) {
    throw new HttpError(503, "Fitur rencana AI belum diaktifkan di server ini.");
  }

  const user = currentUser(req);
  const taskId = parseId(req.params.id, NOT_FOUND);
  const task = await findTask(user.id, taskId);

  if (!task) {
    throw new HttpError(404, NOT_FOUND);
  }
  if (task.status === "selesai") {
    throw new HttpError(400, "Tugas yang sudah selesai tidak perlu rencana kerja.");
  }

  let plan;
  try {
    plan = await planGenerator.generate({ ...task, now: new Date() });
  } catch (error) {
    // detail error model hanya dicatat di log, pengguna menerima pesan umum
    console.error(error);
    throw new HttpError(502, "Rencana kerja gagal dibuat. Coba lagi sebentar lagi.");
  }

  const saved = await savePlan(taskId, plan, planGenerator.model);
  res.status(201).json({ plan: saved });
});

export default router;
