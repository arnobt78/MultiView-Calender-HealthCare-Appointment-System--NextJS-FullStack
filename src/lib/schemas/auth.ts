/**
 * Auth request validation schemas (login + registration).
 *
 * Zod v4 migration note:
 *  - `z.email("message")` replaces the deprecated `z.string().email("message")`.
 */

import { z } from "zod";

export const loginRequestSchema = z.object({
  // z.email() is the Zod v4 standalone email validator
  email: z.email("Invalid email format").trim().max(255),
  password: z.string().min(6, "Password must be at least 6 characters").max(128),
});

export const registerRequestSchema = z.object({
  email: z.email("Invalid email format").trim().max(255),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(128, "Password is too long"),
  display_name: z
    .string()
    .trim()
    .min(2, "Display name is too short")
    .max(80, "Display name is too long")
    .optional()
    .nullable(),
});

export type LoginRequest = z.infer<typeof loginRequestSchema>;
export type RegisterRequest = z.infer<typeof registerRequestSchema>;
