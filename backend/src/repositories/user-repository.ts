import { pool } from "../db/pool.js";

export interface PublicUser {
  id: number;
  nama: string;
  email: string;
}

export interface UserWithPassword extends PublicUser {
  password_hash: string;
}

export async function findUserByEmail(email: string): Promise<UserWithPassword | undefined> {
  const { rows } = await pool.query<UserWithPassword>(
    "select id, nama, email, password_hash from users where lower(email) = lower($1)",
    [email],
  );
  return rows[0];
}

export async function createUser(input: {
  nama: string;
  email: string;
  passwordHash: string;
}): Promise<PublicUser> {
  const { rows } = await pool.query<PublicUser>(
    "insert into users (nama, email, password_hash) values ($1, $2, $3) returning id, nama, email",
    [input.nama, input.email, input.passwordHash],
  );
  return rows[0]!;
}
