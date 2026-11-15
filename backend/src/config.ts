import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(4000),
  DATABASE_URL: z.url(),
  JWT_SECRET: z.string().min(32, "JWT_SECRET minimal 32 karakter"),
  // fitur rencana ai hanya aktif jika api key tersedia
  GEMINI_API_KEY: z.string().min(1).optional(),
  GEMINI_MODEL: z.string().min(1).default("gemini-3.1-flash-lite"),
});

// env divalidasi sekali saat startup supaya salah konfigurasi langsung ketahuan
const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error(z.prettifyError(parsed.error));
  throw new Error("Konfigurasi environment tidak valid");
}

export const env = parsed.data;
