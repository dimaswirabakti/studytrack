import { z } from "zod";
import { HttpError } from "./http-error.js";

// validasi data dengan schema zod, pesan error pertama dikirim sebagai respons 400
export function parseOrThrow<Schema extends z.ZodType>(
  schema: Schema,
  data: unknown,
): z.output<Schema> {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw new HttpError(400, result.error.issues[0]?.message ?? "Input tidak valid.");
  }
  return result.data;
}

const idSchema = z.coerce.number().int().positive();

// id pada url yang tidak valid diperlakukan sama seperti data yang tidak ditemukan
export function parseId(value: unknown, notFoundMessage: string): number {
  const result = idSchema.safeParse(value);
  if (!result.success) {
    throw new HttpError(404, notFoundMessage);
  }
  return result.data;
}
