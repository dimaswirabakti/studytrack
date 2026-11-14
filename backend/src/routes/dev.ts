import { Router } from "express";
import { resetDatabase } from "../db/seed.js";

const router = Router();

// post /api/dev/reset mengembalikan data ke kondisi seed, hanya didaftarkan di luar production
router.post("/reset", async (_req, res) => {
  await resetDatabase();
  res.json({ success: true, message: "Database direset ke data seed awal." });
});

export default router;
