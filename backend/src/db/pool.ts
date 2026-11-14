import pg from "pg";
import { env } from "../config.js";

// kolom timestamp tanpa zona waktu dikembalikan apa adanya dalam format iso lokal
pg.types.setTypeParser(pg.types.builtins.TIMESTAMP, (value) => value.replace(" ", "T"));

// kolom timestamptz dikembalikan sebagai string iso 8601 dalam utc
pg.types.setTypeParser(pg.types.builtins.TIMESTAMPTZ, (value) => new Date(value).toISOString());

export const pool = new pg.Pool({
  connectionString: env.DATABASE_URL,
  max: 5,
});
