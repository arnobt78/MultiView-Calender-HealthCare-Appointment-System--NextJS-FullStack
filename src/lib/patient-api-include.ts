/** Primary doctor — include portrait for SSR first-paint (no robohash flash). */
export const patientPrimaryDoctorPick = {
  select: { display_name: true, email: true, specialty: true, image: true },
} as const;

export const patientUserPick = {
  select: { display_name: true, email: true, specialty: true },
} as const;

export const patientDetailInclude = {
  created_by: patientUserPick,
  updated_by: patientUserPick,
  primary_doctor: patientPrimaryDoctorPick,
} as const;
