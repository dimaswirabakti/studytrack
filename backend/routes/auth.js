import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { readDB, writeDB } from "../db.js";
import { JWT_SECRET } from "../config.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

/**
 * Membuat JWT yang berlaku 7 hari untuk pengguna.
 *
 * @param {{ id: number, nama: string, email: string }} user
 * @returns {string} Token JWT.
 */
function signToken(user) {
  return jwt.sign(
    { sub: user.id, nama: user.nama, email: user.email },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
}

/**
 * POST /api/auth/register
 * Mendaftarkan akun baru, lalu langsung mengembalikan token login.
 *
 * Body     : { nama, email, password } (password minimal 6 karakter)
 * Response : 201 { token, user } | 400 input tidak valid | 409 email sudah terdaftar
 */
router.post("/register", (req, res) => {
  const { nama, email, password } = req.body;

  if (!nama || !email || !password) {
    return res.status(400).json({ error: "Nama, email, dan password wajib diisi." });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: "Password minimal 6 karakter." });
  }

  const db = readDB();
  const existing = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    return res.status(409).json({ error: "Email sudah terdaftar." });
  }

  const newUser = {
    id: db.nextIds.user++,
    nama,
    email,
    password_hash: bcrypt.hashSync(password, 10)
  };
  db.users.push(newUser);
  writeDB(db);

  const token = signToken(newUser);
  res.status(201).json({
    token,
    user: { id: newUser.id, nama: newUser.nama, email: newUser.email }
  });
});

/**
 * POST /api/auth/login
 * Memverifikasi email dan password, lalu mengembalikan token login.
 *
 * Body     : { email, password }
 * Response : 200 { token, user } | 400 input kosong | 401 email atau password salah
 */
router.post("/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email dan password wajib diisi." });
  }

  const db = readDB();
  const user = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    return res.status(401).json({ error: "Email atau password salah." });
  }

  const token = signToken(user);
  res.json({
    token,
    user: { id: user.id, nama: user.nama, email: user.email }
  });
});

/**
 * GET /api/auth/me
 * Mengembalikan profil pengguna dari token yang sedang dipakai.
 *
 * Response : 200 { user } | 401 token tidak ada atau tidak valid
 */
router.get("/me", requireAuth, (req, res) => {
  res.json({ user: req.user });
});

export default router;
