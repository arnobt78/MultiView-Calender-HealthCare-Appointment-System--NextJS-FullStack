/**
 * Portal + patient-dashboard appointment → `FullAppointment` clinician contract.
 * Keeps `category` as UUID string from `serializeAppointment`; rich chip uses `category_data`.
 */

import type { FullAppointment } from "@/hooks/useAppointments";
import type { PortalAppointmentRow, PortalAppointmentClinicianUser } from "@/lib/serializers";
import type { AppointmentAssignee, Patient } from "@/types/types";

/** "Name (email)" — shared by portal timeline and dashboard cards; never expose raw UUID in UI. */
export function formatClinicianNameEmailLabel(
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

/** @deprecated Use `formatClinicianNameEmailLabel`. */
export const formatStaffNameEmailLabel = formatClinicianNameEmailLabel;

export function portalClinicianDisplayLabel(
  clinician: PortalAppointmentClinicianUser | null | undefined
): string {
  if (!clinician) return "--";
  return formatClinicianNameEmailLabel(clinician.display_name, clinician.email);
}

/** @deprecated Use `portalClinicianDisplayLabel`. */
export const portalStaffDisplayLabel = portalClinicianDisplayLabel;

export function portalOwnerDisplayLabel(
  owner: PortalAppointmentRow["owner"]
): string {
  return portalClinicianDisplayLabel(owner);
}

export function portalTreatingDisplayLabel(
  treating: PortalAppointmentRow["treating_physician"]
): string {
  return portalClinicianDisplayLabel(treating);
}

/**
 * Primary doctor row on dashboard cards — denormalized patient fields first, then clinician lookup.
 * Returns null when unknown; never a raw UUID string.
 */
export function resolvePrimaryDoctorCardLabel(
  patientData: Patient | null | undefined,
  primaryDoctorId: string | null,
  resolveClinicianLabel: (userId: string) => string
): string | null {
  if (!primaryDoctorId) return null;
  if (patientData?.primary_doctor_id === primaryDoctorId) {
    const fromPatient = formatClinicianNameEmailLabel(
      patientData.primary_doctor_display,
      patientData.primary_doctor_email
    );
    if (fromPatient !== "--") return fromPatient;
  }
  const fromDirectory = resolveClinicianLabel(primaryDoctorId);
  return fromDirectory === "--" ? null : fromDirectory;
}

export type AttachPortalClinicianExtras = {
  patient_data?: Patient | null;
  appointment_assignee?: (AppointmentAssignee & { invited_email?: string })[];
};

/** @deprecated Use `AttachPortalClinicianExtras`. */
export type AttachPortalStaffExtras = AttachPortalClinicianExtras;

/**
 * Maps API row with embedded `owner` / `treating_physician` → `FullAppointment.portal_*` fields.
 * Used by patient portal adapter and patient dashboard `useAppointments` join.
 */
export function attachPortalClinicianToFullAppointment(
  row: PortalAppointmentRow,
  extras?: AttachPortalClinicianExtras
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

/** @deprecated Use `attachPortalClinicianToFullAppointment`. */
export const attachPortalStaffToFullAppointment = attachPortalClinicianToFullAppointment;

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
  return attachPortalClinicianToFullAppointment(row, {
    patient_data: patient ?? undefined,
    appointment_assignee: [],
  });
}
