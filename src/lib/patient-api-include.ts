/** Primary doctor — include portrait for SSR first-paint (no robohash flash). */
export const patientPrimaryDoctorPick = {
  select: { display_name: true, email: true, specialty: true, image: true },
} as const;

/** Patient/category list joins — label only (no audit portrait). */
export const patientUserPick = {
  select: { display_name: true, email: true, specialty: true },
} as const;

/** Record Audit on patient detail — portrait + role badge (SSR first paint). */
export const patientAuditUserPick = {
  select: { id: true, display_name: true, email: true, image: true, role: true },
} as const;

/** Appointment audit rows — portrait + role badge on detail Record Audit card. */
export const appointmentAuditUserPick = {
  select: { id: true, display_name: true, email: true, image: true, role: true },
} as const;

export const patientDetailInclude = {
  created_by: patientAuditUserPick,
  updated_by: patientAuditUserPick,
  primary_doctor: patientPrimaryDoctorPick,
} as const;
