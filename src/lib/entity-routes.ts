/**
 * Role-aware detail URLs — single map so UI never hardcodes `/control-panel/*` for doctors/patients.
 *
 * Admin → `/control-panel/...` (management shell + sidebar).
 * Doctor / patient → top-level `/appointments`, `/patients`, etc. (dashboard shell, no control panel).
 */

import { isAdminRole } from "@/lib/rbac";

export type EntityRole = string | null | undefined;

/** Appointment detail — admin uses control panel; doctor/patient use portal routes. */
export function appointmentDetailHref(role: EntityRole, id: string): string {
  if (isAdminRole(role)) return `/control-panel/appointments/${id}`;
  return `/appointments/${id}`;
}

/** Patient chart — admin in CP; doctor/patient on `/patients/:id`. */
export function patientDetailHref(role: EntityRole, id: string): string {
  if (isAdminRole(role)) return `/control-panel/patients/${id}`;
  return `/patients/${id}`;
}

/**
 * Portal patient link with optional roster context (`/doctors/:id` patient list).
 * `fromDoctor` enables view-only directory browse per `resolvePatientAccess`.
 */
export function patientDetailHrefWithContext(
  role: EntityRole,
  patientId: string,
  fromDoctorId?: string | null
): string {
  const base = patientDetailHref(role, patientId);
  if (!fromDoctorId || isAdminRole(role)) return base;
  return `${base}?fromDoctor=${encodeURIComponent(fromDoctorId)}`;
}

/** Category detail — admin in CP; staff doctor reads `/categories/:id`. */
export function categoryDetailHref(role: EntityRole, id: string): string {
  if (isAdminRole(role)) return `/control-panel/categories/${id}`;
  return `/categories/${id}`;
}

/** Doctor profile — admin in CP; doctor/patient use `/doctors/:id`. */
export function doctorDetailHref(role: EntityRole, id: string): string {
  if (isAdminRole(role)) return `/control-panel/doctors/${id}`;
  return `/doctors/${id}`;
}

/** Admin/staff user record — control panel only (doctors/patients should not link here). */
export function userDetailHref(role: EntityRole, id: string): string {
  if (isAdminRole(role)) return `/control-panel/users/${id}`;
  return `/control-panel/users/${id}`;
}

/** Invoice detail — admin control panel only in current product scope. */
export function invoiceDetailHref(role: EntityRole, id: string): string {
  return `/control-panel/invoices/${id}`;
}

/** Notification deep links from API — role-aware appointment path. */
export function appointmentNotificationLink(role: EntityRole, appointmentId: string): string {
  return appointmentDetailHref(role, appointmentId);
}
