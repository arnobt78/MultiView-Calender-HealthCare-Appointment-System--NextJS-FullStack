/**
 * Patient portal appointment → dashboard `FullAppointment` adapter.
 * Keeps `category` as UUID string from `serializeAppointment`; rich chip uses `category_data`.
 */

import type { FullAppointment } from "@/hooks/useAppointments";
import type { PortalAppointmentRow } from "@/lib/serializers";
import type { Patient } from "@/types/types";

export function portalOwnerDisplayLabel(
  owner: PortalAppointmentRow["owner"]
): string {
  if (!owner) return "--";
  return owner.display_name?.trim() || owner.email || owner.id;
}

export function portalTreatingDisplayLabel(
  treating: PortalAppointmentRow["treating_physician"]
): string {
  if (!treating) return "--";
  return treating.display_name?.trim() || treating.email || treating.id;
}

/**
 * Maps portal API/prefetch row into `AppointmentCard` + `useAppointmentCardModel` input.
 * `patient` optional — when provided, fills `patient_data` for client link + primary doctor rows.
 */
export function portalAppointmentToFullAppointment(
  row: PortalAppointmentRow,
  patient?: Patient | null
): FullAppointment {
  return {
    ...row,
    patient_data: patient ?? undefined,
    appointment_assignee: [],
    portal_owner: row.owner,
    portal_treating_physician: row.treating_physician,
  };
}
