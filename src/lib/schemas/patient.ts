/**
 * Patient core validation schema.
 *
 * Zod v4 migration note:
 *  - `z.email("message")` replaces the deprecated `z.string().email("message")`.
 *    `z.email()` is a standalone string-based validator; `.trim()`, `.max()`,
 *    `.optional()`, and `.nullable()` chain on it exactly as before.
 */

import { z } from "zod";

export const patientCoreSchema = z.object({
  first_name: z.string().trim().min(1, "First name is required").max(100),
  last_name: z.string().trim().min(1, "Last name is required").max(100),
  // z.email() is the Zod v4 standalone email validator (replaces .string().email())
  email: z.email("Invalid email").trim().max(255).optional().nullable(),
  phone: z.string().trim().max(30).optional().nullable(),
  date_of_birth: z.string().trim().optional().nullable(),
  gender: z.string().trim().max(40).optional().nullable(),
  address: z.string().trim().max(255).optional().nullable(),
  notes: z.string().trim().max(2000).optional().nullable(),
});
