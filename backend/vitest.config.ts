import { existsSync, readFileSync } from "node:fs";
import { parseEnv } from "node:util";
import { defineConfig } from "vitest/config";

// integration test hanya membaca test database url supaya tidak pernah menyentuh database dev atau production
const fileEnv = existsSync(".env.test") ? parseEnv(readFileSync(".env.test", "utf8")) : {};
const testDatabaseUrl = process.env.TEST_DATABASE_URL ?? fileEnv.TEST_DATABASE_URL ?? "";

export default defineConfig({
  test: {
    // file test dijalankan berurutan karena integration test berbagi satu database
    fileParallelism: false,
    env: {
      NODE_ENV: "test",
      TEST_DATABASE_URL: testDatabaseUrl,
      DATABASE_URL: testDatabaseUrl || "postgresql://localhost/test-database-belum-diatur",
      JWT_SECRET: "secret-khusus-test-yang-panjangnya-lebih-dari-32-karakter",
    },
  },
});
