/**
 * Doctor portal patients panel — possessive title + active/inactive roster counters.
 */

import type { Patient } from "@/types/types";

export const DOCTOR_PORTAL_PATIENTS_SUBTITLE =
  "Patients assigned to you as primary care — counts by roster status";

/** Panel title — possessive when we know the signed-in doctor's display name. */
export function doctorPortalPatientsSectionTitle(
  displayName: string | null | undefined
): string {
  const name = displayName?.trim();
  if (!name) return "My Related Patients";
  return `${name}'s Related Patients`;
}

export type DoctorPortalPatientStatusCounts = {
  active: number;
  inactive: number;
};

/** Roster scoped to `primary_doctor_id` (doctor portal API + locked filter). */
export function filterDoctorPortalPatientRoster(
  patients: ReadonlyArray<Patient>,
  doctorId: string | null | undefined
): Patient[] {
  if (!doctorId) return [];
  return patients.filter((p) => p.primary_doctor_id === doctorId);
}

export function countDoctorPortalPatientsByStatus(
  patients: ReadonlyArray<Patient>
): DoctorPortalPatientStatusCounts {
  let active = 0;
  let inactive = 0;
  for (const p of patients) {
    if (p.active) active += 1;
    else inactive += 1;
  }
  return { active, inactive };
}

/** Compact pill — billing status chip parity (`Active: n · Inactive: n`). */
export function doctorPortalPatientStatusBadgeLabel(
  counts: DoctorPortalPatientStatusCounts
): string {
  return `Active: ${counts.active} · Inactive: ${counts.inactive}`;
}
