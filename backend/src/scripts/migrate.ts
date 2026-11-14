import { runMigrations } from "../db/migrator.js";
import { pool } from "../db/pool.js";

try {
  const applied = await runMigrations();
  console.log(
    applied.length > 0 ? `Migrasi diterapkan ${applied.join(", ")}` : "Skema sudah yang terbaru",
  );
} finally {
  await pool.end();
}
