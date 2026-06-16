/**
 * Related Appointments table link rules — entity detail pages pass a policy so portal
 * roles do not navigate to routes that SSR/RBAC block (404).
 */
import { isDoctorRole, isPatientRole } from "@/lib/rbac";
import type { EntityRole } from "@/lib/entity-routes";

export type CalendarOwnerLinkKind = "none" | "role" | "admin-cp" | "portal-admin";

export type RelatedAppointmentsLinkPolicy = {
  /** Appointment type line in Title column — default true when policy omitted. */
  appointmentTitle: boolean;
  /** Patient identity under title — default true when policy omitted. */
  patientInTitle: boolean;
  /** Category column — default true when policy omitted. */
  categoryLink: boolean;
  /** Treating physician column — default true (uses `none` when false). */
  treatingPhysicianLink: boolean;
  /** Calendar owner name link — `none` = plain label (admins on patient portal, etc.). */
  calendarOwner: (ctx: { ownerRole: string | null }) => CalendarOwnerLinkKind;
};

/**
 * Portal `/doctors/:id` — patient viewer: no appointment/patient links (404); doctor staff stay linked.
 * Admin calendar owners stay plain (no patient-safe staff route).
 */
export const DOCTOR_DETAIL_PATIENT_SNAPSHOT_LINKS: RelatedAppointmentsLinkPolicy = {
  appointmentTitle: false,
  patientInTitle: false,
  categoryLink: true,
  treatingPhysicianLink: true,
  calendarOwner: ({ ownerRole }) =>
    ownerRole === "admin" ? "none" : ownerRole === "doctor" ? "role" : "none",
};

/**
 * Portal `/doctors/:id` — doctor viewer: doctors → `/doctors/:id`; admin owners → `/admins/:id`.
 * Appointment title + other patients stay plain (RBAC).
 */
export const DOCTOR_DETAIL_DOCTOR_SNAPSHOT_LINKS: RelatedAppointmentsLinkPolicy = {
  appointmentTitle: false,
  patientInTitle: false,
  categoryLink: true,
  treatingPhysicianLink: true,
  calendarOwner: ({ ownerRole }) =>
    ownerRole === "admin" ? "portal-admin" : ownerRole === "doctor" ? "role" : "none",
};

/**
 * Portal `/appointments/:id` — doctor viewer: full People links when appointment is on their queue.
 * Differs from doctor-entity snapshot tables where other patients stay plain.
 */
export const APPOINTMENT_DETAIL_PORTAL_DOCTOR_LINKS: RelatedAppointmentsLinkPolicy = {
  appointmentTitle: true,
  patientInTitle: true,
  categoryLink: true,
  treatingPhysicianLink: true,
  calendarOwner: DOCTOR_DETAIL_DOCTOR_SNAPSHOT_LINKS.calendarOwner,
};

/**
 * Portal `/appointments/:id` — patient viewer: own chart link optional plain in People row.
 */
export const APPOINTMENT_DETAIL_PORTAL_PATIENT_LINKS: RelatedAppointmentsLinkPolicy = {
  appointmentTitle: true,
  patientInTitle: false,
  categoryLink: true,
  treatingPhysicianLink: true,
  calendarOwner: ({ ownerRole }) =>
    ownerRole === "admin" ? "none" : ownerRole === "doctor" ? "role" : "none",
};

/**
 * Portal entity detail (`/doctors/:id`, `/categories/:id`) — related appointments table.
 * CP admin keeps full links when policy omitted.
 */
export function resolvePortalEntityDetailSnapshotLinkPolicy(
  viewerRole: EntityRole
): RelatedAppointmentsLinkPolicy | undefined {
  if (isPatientRole(viewerRole)) return DOCTOR_DETAIL_PATIENT_SNAPSHOT_LINKS;
  if (isDoctorRole(viewerRole)) return DOCTOR_DETAIL_DOCTOR_SNAPSHOT_LINKS;
  return undefined;
}

/**
 * Portal `/appointments/:id` — People + category links (not doctor-entity snapshot tables).
 * CP / admin callers omit policy for full default links.
 */
export function resolvePortalAppointmentDetailLinkPolicy(
  viewerRole: EntityRole
): RelatedAppointmentsLinkPolicy | undefined {
  if (isPatientRole(viewerRole)) return APPOINTMENT_DETAIL_PORTAL_PATIENT_LINKS;
  if (isDoctorRole(viewerRole)) return APPOINTMENT_DETAIL_PORTAL_DOCTOR_LINKS;
  return undefined;
}

/** @deprecated Use `resolvePortalEntityDetailSnapshotLinkPolicy`. */
export const resolveDoctorDetailSnapshotLinkPolicy =
  resolvePortalEntityDetailSnapshotLinkPolicy;

/** Resolve calendar owner link kind — falls back to legacy admin-cp / role when no policy. */
export function resolveCalendarOwnerLinkKind(
  viewerRole: EntityRole,
  ownerRole: string | null | undefined,
  policy?: RelatedAppointmentsLinkPolicy
): CalendarOwnerLinkKind {
  if (policy) {
    return policy.calendarOwner({ ownerRole: ownerRole ?? null });
  }
  return viewerRole === "admin" ? "admin-cp" : "role";
}

/**
 * Treating physician column — mirrors calendar-owner rules when policy supplies `calendarOwner`.
 * Defaults to role-aware doctor links (portal `/doctors/:id` or CP).
 */
export function resolveTreatingPhysicianLinkKind(
  viewerRole: EntityRole,
  policy?: RelatedAppointmentsLinkPolicy,
  staffRole?: string | null
): CalendarOwnerLinkKind {
  if (policy && !policy.treatingPhysicianLink) return "none";
  if (policy?.calendarOwner && staffRole != null) {
    return policy.calendarOwner({ ownerRole: staffRole });
  }
  return viewerRole === "admin" ? "admin-cp" : "role";
}

/** Category column link toggle — defaults to linked when policy omitted. */
export function resolveCategoryLinkEnabled(policy?: RelatedAppointmentsLinkPolicy): boolean {
  return policy?.categoryLink ?? true;
}
