import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config.js";

/**
 * Middleware autentikasi. Memverifikasi JWT dari header
 * `Authorization: Bearer <token>`.
 *
 * Jika token valid, data pengguna disimpan di `req.user` ({ id, nama, email })
 * dan request diteruskan. Jika tidak, server membalas 401.
 */
export function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: "Token tidak ditemukan. Silakan login terlebih dahulu." });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = { id: payload.sub, nama: payload.nama, email: payload.email };
    next();
  } catch {
    return res.status(401).json({ error: "Token tidak valid atau sudah kedaluwarsa." });
  }
}
