/** Prisma include for patient responses — keeps audit + primary-doctor labels in sync across GET/POST/PUT/snapshot */
export const patientUserPick = {
  select: { display_name: true, email: true },
} as const;

export const patientDetailInclude = {
  created_by: patientUserPick,
  updated_by: patientUserPick,
  primary_doctor: patientUserPick,
} as const;
