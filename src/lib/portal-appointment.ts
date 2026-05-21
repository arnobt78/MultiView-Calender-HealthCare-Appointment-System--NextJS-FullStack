/**
 * Portal + patient-dashboard appointment → `FullAppointment` staff contract.
 * Keeps `category` as UUID string from `serializeAppointment`; rich chip uses `category_data`.
 */

import type { FullAppointment } from "@/hooks/useAppointments";
import type { PortalAppointmentRow, PortalAppointmentStaffUser } from "@/lib/serializers";
import type { AppointmentAssignee, Patient } from "@/types/types";

/** "Name (email)" — shared by portal timeline and dashboard cards; never expose raw UUID in UI. */
export function formatStaffNameEmailLabel(
  displayName: string | null | undefined,
  email: string | null | undefined
): string {
  const name = displayName?.trim();
  const mail = email?.trim();
  if (name && mail) return `${name} (${mail})`;
  if (name) return name;
  if (mail) return mail;
  return "--";
}

export function portalStaffDisplayLabel(
  staff: PortalAppointmentStaffUser | null | undefined
): string {
  if (!staff) return "--";
  return formatStaffNameEmailLabel(staff.display_name, staff.email);
}

export function portalOwnerDisplayLabel(
  owner: PortalAppointmentRow["owner"]
): string {
  return portalStaffDisplayLabel(owner);
}

export function portalTreatingDisplayLabel(
  treating: PortalAppointmentRow["treating_physician"]
): string {
  return portalStaffDisplayLabel(treating);
}

/**
 * Primary doctor row on dashboard cards — denormalized patient fields first, then staff lookup.
 * Returns null when unknown; never a raw UUID string.
 */
export function resolvePrimaryDoctorCardLabel(
  patientData: Patient | null | undefined,
  primaryDoctorId: string | null,
  resolveStaffLabel: (userId: string) => string
): string | null {
  if (!primaryDoctorId) return null;
  if (patientData?.primary_doctor_id === primaryDoctorId) {
    const fromPatient = formatStaffNameEmailLabel(
      patientData.primary_doctor_display,
      patientData.primary_doctor_email
    );
    if (fromPatient !== "--") return fromPatient;
  }
  const fromDirectory = resolveStaffLabel(primaryDoctorId);
  return fromDirectory === "--" ? null : fromDirectory;
}

export type AttachPortalStaffExtras = {
  patient_data?: Patient | null;
  appointment_assignee?: (AppointmentAssignee & { invited_email?: string })[];
};

/**
 * Maps API row with embedded `owner` / `treating_physician` → `FullAppointment.portal_*` fields.
 * Used by patient portal adapter and patient dashboard `useAppointments` join.
 */
export function attachPortalStaffToFullAppointment(
  row: PortalAppointmentRow,
  extras?: AttachPortalStaffExtras
): FullAppointment {
  return {
    ...row,
    category_data: row.category_data,
    patient_data: extras?.patient_data ?? undefined,
    appointment_assignee: extras?.appointment_assignee ?? [],
    portal_owner: row.owner,
    portal_treating_physician: row.treating_physician,
  };
}

/** True when GET /api/appointments returned portal-shaped rows (patient caller). */
export function isPortalSerializedAppointmentRow(
  row: Record<string, unknown>
): row is PortalAppointmentRow {
  return "category_data" in row || "owner" in row;
}

/**
 * Maps portal API/prefetch row into `AppointmentCard` + `useAppointmentCardModel` input.
 */
export function portalAppointmentToFullAppointment(
  row: PortalAppointmentRow,
  patient?: Patient | null
): FullAppointment {
  return attachPortalStaffToFullAppointment(row, {
    patient_data: patient ?? undefined,
    appointment_assignee: [],
  });
}
