import { appointmentAuditUserPick } from "@/lib/patient-api-include";

/** Staff audit actor — portrait + role badge on user/doctor detail Record Audit. */
export const userAuditUserPick = appointmentAuditUserPick;

/** Prisma include for user/doctor detail GET + SSR prefetch (audit actors). */
export const userDetailInclude = {
  created_by: userAuditUserPick,
  updated_by: userAuditUserPick,
} as const;
