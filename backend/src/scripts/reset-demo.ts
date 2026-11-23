import { pool } from "../db/pool.js";
import { ensureDemoAccount } from "../db/seed.js";

// menyegarkan data akun demo saja, aman dijalankan ke database production
try {
  const userId = await ensureDemoAccount();
  console.log(`Data akun demo (user ${userId}) disegarkan dari waktu sekarang`);
} finally {
  await pool.end();
}
