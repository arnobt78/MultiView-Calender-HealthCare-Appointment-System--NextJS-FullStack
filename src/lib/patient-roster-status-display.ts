/**
 * Doctor portal patients panel — inline Active/Inactive count text colors.
 */

import type { DoctorPortalPatientStatusCounts } from "@/lib/doctor-portal-patients-display";

/** Segment order — shared by string label + PatientRosterStatusCountInlineRow. */
export const PATIENT_ROSTER_STATUS_INLINE_ORDER = ["active", "inactive"] as const;

export type PatientRosterStatusInlineKey =
  (typeof PATIENT_ROSTER_STATUS_INLINE_ORDER)[number];

/** Text color aligned with EntityActiveStatusBadge glass tones. */
export function patientRosterStatusInlineTextClass(active: boolean): string {
  return active ? "text-emerald-700" : "text-slate-600";
}

export function patientRosterStatusInlineLabel(key: PatientRosterStatusInlineKey): string {
  return key === "active" ? "Active" : "Inactive";
}

export function patientRosterStatusInlineCount(
  counts: DoctorPortalPatientStatusCounts,
  key: PatientRosterStatusInlineKey
): number {
  return counts[key];
}
