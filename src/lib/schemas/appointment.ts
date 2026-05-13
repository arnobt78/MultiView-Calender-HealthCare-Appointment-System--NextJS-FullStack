/**
 * Appointment validation schemas.
 *
 * Zod v4 migration note:
 *  - `z.url("message")` replaces the deprecated `z.string().url("message")`.
 *    `z.url()` is a standalone string-based URL validator that chains the same
 *    way (e.g. inside `z.array()`).
 */

import { z } from "zod";
import { isoDateSchema, notesSchema, statusSchema, titleSchema } from "./common";

export const appointmentCreateSchema = z
  .object({
    title: titleSchema,
    start: isoDateSchema,
    end: isoDateSchema,
    location: z.string().trim().max(255).optional().nullable(),
    // patient and category are UUID foreign keys.
    // Empty string is coerced to null so the UI can clear a selection without
    // Prisma rejecting an invalid UUID. Non-empty values must be a valid v4 UUID.
    patient: z.preprocess(
      (v) => (typeof v === "string" && v.trim() === "" ? null : v),
      z.string().uuid("patient must be a valid UUID").optional().nullable()
    ) as z.ZodType<string | null | undefined>,
    /** B2: optional FK to `users.id` (typically a doctor); defaults server-side to calendar owner when omitted. */
    treating_physician: z.preprocess(
      (v) => (typeof v === "string" && v.trim() === "" ? null : v),
      z.string().uuid("treating_physician must be a valid UUID").optional().nullable()
    ) as z.ZodType<string | null | undefined>,
    category: z.preprocess(
      (v) => (typeof v === "string" && v.trim() === "" ? null : v),
      z.string().uuid("category must be a valid UUID").optional().nullable()
    ) as z.ZodType<string | null | undefined>,
    notes: notesSchema,
    status: statusSchema.optional().nullable(),
    // z.url() is the Zod v4 standalone URL validator (replaces .string().url())
    attachments: z.array(z.url("Invalid attachment URL")).max(20).optional(),
    /** FK to appointment_types — used to derive is_telehealth and duration_minutes */
    appointment_type_id: z.preprocess(
      (v) => (typeof v === "string" && v.trim() === "" ? null : v),
      z.string().uuid("appointment_type_id must be a valid UUID").optional().nullable()
    ) as z.ZodType<string | null | undefined>,
    /** Chief complaint / reason for visit from the patient */
    chief_complaint: z.string().trim().max(500).optional().nullable(),
    /** Actual appointment duration in minutes */
    duration_minutes: z.number().int().min(5).max(720).optional().nullable(),
    /** Video / telehealth meeting URL (only relevant when is_telehealth = true) */
    telehealth_link: z.string().trim().max(2048).optional().nullable(),
  })
  .refine((data) => new Date(data.end).getTime() > new Date(data.start).getTime(), {
    message: "End date must be after start date",
    path: ["end"],
  });

export const appointmentIcsImportSchema = z.object({
  content: z
    .string()
    .min(1, "Missing .ics content")
    .max(1024 * 1024, "File too large. Maximum size is 1 MB.")
    .refine((value) => value.includes("BEGIN:VCALENDAR"), "Invalid .ics file content"),
});

export type AppointmentCreateInput = z.infer<typeof appointmentCreateSchema>;
