import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { env } from "../config.js";
import { HttpError } from "../lib/http-error.js";
import type { PublicUser } from "../repositories/user-repository.js";

const tokenPayloadSchema = z.object({
  sub: z.string(),
  nama: z.string(),
  email: z.string(),
});

// token login berlaku 7 hari
export function signToken(user: PublicUser): string {
  return jwt.sign({ nama: user.nama, email: user.email }, env.JWT_SECRET, {
    subject: String(user.id),
    expiresIn: "7d",
  });
}

// memverifikasi jwt dari header authorization lalu menyimpan data user di req.user
export function requireAuth(req: Request, _res: Response, next: NextFunction): void {
  const header = req.headers.authorization ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    throw new HttpError(401, "Token tidak ditemukan. Silakan login terlebih dahulu.");
  }

  try {
    const payload = tokenPayloadSchema.parse(jwt.verify(token, env.JWT_SECRET));
    req.user = { id: Number(payload.sub), nama: payload.nama, email: payload.email };
  } catch {
    throw new HttpError(401, "Token tidak valid atau sudah kedaluwarsa.");
  }

  next();
}

// mengambil user yang sedang login, dipakai di route yang sudah melewati middleware auth
export function currentUser(req: Request): PublicUser {
  if (!req.user) {
    throw new HttpError(401, "Token tidak ditemukan. Silakan login terlebih dahulu.");
  }
  return req.user;
}
