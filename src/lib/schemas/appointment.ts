import { z } from "zod";
import { isoDateSchema, notesSchema, statusSchema, titleSchema } from "./common";

export const appointmentCreateSchema = z
  .object({
    title: titleSchema,
    start: isoDateSchema,
    end: isoDateSchema,
    location: z.string().trim().max(255).optional().nullable(),
    patient: z.string().trim().optional().nullable(),
    category: z.string().trim().optional().nullable(),
    notes: notesSchema,
    status: statusSchema.optional().nullable(),
    attachements: z.array(z.string().url("Invalid attachment URL")).max(20).optional(),
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
