import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { pool } from "./pool.js";

const MIGRATIONS_DIR = path.resolve(import.meta.dirname, "../../migrations");

// angka tetap untuk advisory lock supaya dua proses migrasi tidak berjalan bersamaan
const MIGRATION_LOCK_ID = 20261113;

// seluruh migrasi dijalankan dalam satu transaksi sehingga aman dipakai lewat connection pooler neon
export async function runMigrations(): Promise<string[]> {
  const client = await pool.connect();

  try {
    await client.query("begin");
    await client.query("select pg_advisory_xact_lock($1)", [MIGRATION_LOCK_ID]);
    await client.query(`
      create table if not exists schema_migrations (
        name text primary key,
        applied_at timestamptz not null default now()
      )
    `);

    const { rows } = await client.query<{ name: string }>("select name from schema_migrations");
    const applied = new Set(rows.map((row) => row.name));

    const files = (await readdir(MIGRATIONS_DIR)).filter((file) => file.endsWith(".sql")).sort();
    const pending = files.filter((file) => !applied.has(file));

    for (const file of pending) {
      const sql = await readFile(path.join(MIGRATIONS_DIR, file), "utf8");
      await client.query(sql);
      await client.query("insert into schema_migrations (name) values ($1)", [file]);
    }

    await client.query("commit");
    return pending;
  } catch (error) {
    await client.query("rollback");
    throw error;
  } finally {
    client.release();
  }
}
