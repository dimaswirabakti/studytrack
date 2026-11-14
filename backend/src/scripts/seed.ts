import { pool } from "../db/pool.js";
import { resetDatabase } from "../db/seed.js";

try {
  await resetDatabase();
  console.log("Database direset ke data seed awal");
} finally {
  await pool.end();
}
