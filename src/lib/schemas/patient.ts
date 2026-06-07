/**
 * Patient core validation schema.
 *
 * Zod v4 migration note:
 *  - `z.email("message")` replaces the deprecated `z.string().email("message")`.
 *    `z.email()` is a standalone string-based validator; `.trim()`, `.max()`,
 *    `.optional()`, and `.nullable()` chain on it exactly as before.
 */

import { z } from "zod";
import { isValidContactPhone } from "@/lib/phone-validation";

/** Optional patient phone — empty allowed; non-empty must pass contact format rules. */
export const optionalPatientPhoneSchema = z
  .string()
  .trim()
  .max(30)
  .optional()
  .nullable()
  .refine((val) => !val || isValidContactPhone(val), {
    message: "Phone must be 7–15 digits; include + country code when possible",
  });

export const patientCoreSchema = z.object({
  first_name: z.string().trim().min(1, "First name is required").max(100),
  last_name: z.string().trim().min(1, "Last name is required").max(100),
  // z.email() is the Zod v4 standalone email validator (replaces .string().email())
  email: z.email("Invalid email").trim().max(255).optional().nullable(),
  phone: optionalPatientPhoneSchema,
  date_of_birth: z.string().trim().optional().nullable(),
  gender: z.string().trim().max(40).optional().nullable(),
  address: z.string().trim().max(255).optional().nullable(),
  notes: z.string().trim().max(2000).optional().nullable(),
});
