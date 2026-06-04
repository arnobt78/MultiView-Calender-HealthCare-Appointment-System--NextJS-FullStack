/**
 * Portal appointment clinician resolution — treating row even when owner === treating (same user).
 */

import type { PortalAppointmentRow, PortalAppointmentClinicianUser } from "@/lib/serializers";

/** Treating physician chip — falls back to owner when IDs match but join duplicated owner only. */
export function resolvePortalTreatingClinician(
  appt: Pick<
    PortalAppointmentRow,
    "treating_physician" | "treating_physician_id" | "user_id" | "owner"
  >
): PortalAppointmentClinicianUser | null | undefined {
  if (appt.treating_physician) return appt.treating_physician;
  const treatingId = appt.treating_physician_id?.trim();
  if (!treatingId) return null;
  if (appt.owner?.id === treatingId) return appt.owner;
  return null;
}

/** @deprecated Use `resolvePortalTreatingClinician`. */
export const resolvePortalTreatingStaff = resolvePortalTreatingClinician;
