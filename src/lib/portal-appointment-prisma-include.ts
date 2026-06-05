/**
 * Prisma selects for portal appointment clinician embeds — keep patient-portal, dashboard, prefetch in sync.
 */
import { APPOINTMENT_TYPE_CARD_SELECT } from "@/lib/appointment-type-include";

export const portalAppointmentClinicianSelect = {
  id: true,
  display_name: true,
  email: true,
  role: true,
  image: true,
  specialty: true,
  consultation_fee: true,
  office_location: true,
} as const;

/** Patient dashboard + portal history — rich card joins. */
export const portalAppointmentListInclude = {
  category: true,
  owner: { select: portalAppointmentClinicianSelect },
  treating_physician: { select: portalAppointmentClinicianSelect },
  appointment_type: { select: APPOINTMENT_TYPE_CARD_SELECT },
} as const;

/** Doctor portal today/upcoming lists — fee + office fallback for visit location display. */
export const doctorPortalAppointmentClinicianSelect = {
  consultation_fee: true,
  office_location: true,
} as const;

export const doctorPortalAppointmentListInclude = {
  appointment_type: { select: APPOINTMENT_TYPE_CARD_SELECT },
  treating_physician: { select: doctorPortalAppointmentClinicianSelect },
  owner: { select: doctorPortalAppointmentClinicianSelect },
} as const;
