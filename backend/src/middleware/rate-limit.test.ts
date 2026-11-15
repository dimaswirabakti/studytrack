import type { Request, Response } from "express";
import { afterEach, describe, expect, it, vi } from "vitest";
import { HttpError } from "../lib/http-error.js";
import { createRateLimiter } from "./rate-limit.js";

function requestFor(userId: number): Request {
  return { user: { id: userId, nama: "Tes", email: "tes@studytrack.test" } } as Request;
}

const response = {} as Response;

function limiterWith(limit: number) {
  return createRateLimiter({
    limit,
    windowMs: 60_000,
    message: "Terlalu sering",
    keyFor: (req) => req.user?.id ?? 0,
  });
}

describe("createRateLimiter", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("menolak permintaan setelah batas tercapai dalam jendela waktu yang sama", () => {
    const limiter = limiterWith(2);
    const next = vi.fn();

    limiter(requestFor(1), response, next);
    limiter(requestFor(1), response, next);

    expect(next).toHaveBeenCalledTimes(2);
    expect(() => limiter(requestFor(1), response, next)).toThrow(HttpError);
  });

  it("menghitung batas secara terpisah untuk setiap kunci", () => {
    const limiter = limiterWith(1);
    const next = vi.fn();

    limiter(requestFor(1), response, next);
    limiter(requestFor(2), response, next);

    expect(next).toHaveBeenCalledTimes(2);
  });

  it("mengizinkan lagi setelah jendela waktu berlalu", () => {
    vi.useFakeTimers();
    const limiter = limiterWith(1);
    const next = vi.fn();

    limiter(requestFor(1), response, next);
    vi.advanceTimersByTime(60_001);
    limiter(requestFor(1), response, next);

    expect(next).toHaveBeenCalledTimes(2);
  });
});
