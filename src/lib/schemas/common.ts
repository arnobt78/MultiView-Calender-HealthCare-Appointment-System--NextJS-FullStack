import { z } from "zod";

export const uuidSchema = z.string().uuid();

export const isoDateSchema = z
  .string()
  .trim()
  .refine((value) => !Number.isNaN(new Date(value).getTime()), "Invalid date-time value");

export const titleSchema = z.string().trim().min(1, "Title is required").max(200, "Title is too long");

export const notesSchema = z
  .string()
  .trim()
  .max(2000, "Notes are too long")
  .optional()
  .or(z.literal(""));

export const statusSchema = z.enum(["pending", "done", "alert", "cancelled"]);

export const optionalStringSchema = z.string().trim().optional().nullable();
