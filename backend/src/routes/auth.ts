import bcrypt from "bcryptjs";
import { Router } from "express";
import { z } from "zod";
import { isUniqueViolation } from "../db/errors.js";
import { HttpError } from "../lib/http-error.js";
import { parseOrThrow } from "../lib/validation.js";
import { currentUser, requireAuth, signToken } from "../middleware/auth.js";
import { createUser, findUserByEmail } from "../repositories/user-repository.js";

const router = Router();

const REGISTER_REQUIRED = "Nama, email, dan password wajib diisi.";
const LOGIN_REQUIRED = "Email dan password wajib diisi.";

const registerSchema = z.object({
  nama: z.string({ error: REGISTER_REQUIRED }).trim().min(1, REGISTER_REQUIRED),
  email: z.email({
    error: (issue) => (issue.input === undefined ? REGISTER_REQUIRED : "Format email tidak valid."),
  }),
  password: z.string({ error: REGISTER_REQUIRED }).min(6, "Password minimal 6 karakter."),
});

const loginSchema = z.object({
  email: z.string({ error: LOGIN_REQUIRED }).min(1, LOGIN_REQUIRED),
  password: z.string({ error: LOGIN_REQUIRED }).min(1, LOGIN_REQUIRED),
});

// post /api/auth/register mendaftarkan akun baru lalu langsung mengembalikan token
router.post("/register", async (req, res) => {
  const input = parseOrThrow(registerSchema, req.body);
  const passwordHash = await bcrypt.hash(input.password, 10);

  try {
    const user = await createUser({ nama: input.nama, email: input.email, passwordHash });
    res.status(201).json({ token: signToken(user), user });
  } catch (error) {
    // unique index pada lower(email) menolak email ganda walau request datang bersamaan
    if (isUniqueViolation(error)) {
      throw new HttpError(409, "Email sudah terdaftar.");
    }
    throw error;
  }
});

// post /api/auth/login memverifikasi email dan password lalu mengembalikan token
router.post("/login", async (req, res) => {
  const input = parseOrThrow(loginSchema, req.body);
  const user = await findUserByEmail(input.email);

  if (!user || !(await bcrypt.compare(input.password, user.password_hash))) {
    throw new HttpError(401, "Email atau password salah.");
  }

  const publicUser = { id: user.id, nama: user.nama, email: user.email };
  res.json({ token: signToken(publicUser), user: publicUser });
});

// get /api/auth/me mengembalikan profil dari token yang sedang dipakai
router.get("/me", requireAuth, (req, res) => {
  res.json({ user: currentUser(req) });
});

export default router;
