import type { PublicUser } from "../repositories/user-repository.js";

declare global {
  namespace Express {
    interface Request {
      // diisi oleh middleware auth setelah token terverifikasi
      user?: PublicUser;
    }
  }
}

export {};
