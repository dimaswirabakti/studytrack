import type { NextFunction, Request, Response } from "express";
import { HttpError } from "../lib/http-error.js";

// fallback untuk endpoint yang tidak terdaftar
export function notFoundHandler(_req: Request, res: Response): void {
  res.status(404).json({ error: "Endpoint tidak ditemukan." });
}

// body json yang rusak ditandai express.json dengan type entity.parse.failed
function isJsonParseError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "type" in error &&
    error.type === "entity.parse.failed"
  );
}

// express 5 meneruskan error dari handler async ke sini secara otomatis
export function errorHandler(
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (error instanceof HttpError) {
    res.status(error.status).json({ error: error.message });
    return;
  }

  if (isJsonParseError(error)) {
    res.status(400).json({ error: "Body request bukan JSON yang valid." });
    return;
  }

  // detail error hanya dicatat di log server, tidak dikirim ke pengguna
  console.error(error);
  res.status(500).json({ error: "Terjadi kesalahan pada server." });
}
