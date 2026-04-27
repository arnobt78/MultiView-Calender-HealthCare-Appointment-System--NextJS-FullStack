import { z } from "zod";

export const patientCoreSchema = z.object({
  first_name: z.string().trim().min(1, "First name is required").max(100),
  last_name: z.string().trim().min(1, "Last name is required").max(100),
  email: z.string().trim().email("Invalid email").max(255).optional().nullable(),
  phone: z.string().trim().max(30).optional().nullable(),
  date_of_birth: z.string().trim().optional().nullable(),
  gender: z.string().trim().max(40).optional().nullable(),
  address: z.string().trim().max(255).optional().nullable(),
  notes: z.string().trim().max(2000).optional().nullable(),
});
