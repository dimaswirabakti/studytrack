import type { NextFunction, Request, Response } from "express";
import { HttpError } from "../lib/http-error.js";

interface RateLimitOptions {
  limit: number;
  windowMs: number;
  message: string;
  // kunci pembeda pemakai, misalnya id user yang sedang login
  keyFor: (req: Request) => string | number;
}

// pembatas berbasis memori, cukup untuk menahan klik beruntun walau tidak dibagi antar instance
export function createRateLimiter({ limit, windowMs, message, keyFor }: RateLimitOptions) {
  const hits = new Map<string | number, number[]>();

  return (req: Request, _res: Response, next: NextFunction): void => {
    const key = keyFor(req);
    const now = Date.now();
    const recent = (hits.get(key) ?? []).filter((time) => now - time < windowMs);

    if (recent.length >= limit) {
      throw new HttpError(429, message);
    }

    recent.push(now);
    hits.set(key, recent);
    next();
  };
}
