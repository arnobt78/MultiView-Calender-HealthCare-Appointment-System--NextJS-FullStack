/**
 * Portal appointment card field visibility — patients see visit context, not staff-only notes.
 */

import { isAdminRole, isDoctorRole } from "@/lib/rbac";

export function canShowAppointmentClinicalNotes(role: string | null | undefined): boolean {
  return isAdminRole(role) || isDoctorRole(role);
}
