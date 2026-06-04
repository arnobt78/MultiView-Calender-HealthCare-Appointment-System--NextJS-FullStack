/**
 * Prisma `appointment_type` select for calendar cards, portal rows, and GET /api/appointments.
 * Keeps `name` + `duration_minutes` on the wire so category meta rows avoid title parsing.
 */

export const APPOINTMENT_TYPE_CARD_SELECT = {
  name: true,
  price_cents: true,
  duration_minutes: true,
} as const;

type AppointmentTypeJoin = {
  name?: string | null;
  price_cents?: number | null;
  duration_minutes?: number | null;
} | null | undefined;

/** Spread into `serializeAppointment({ ...row, ... })` after Prisma include. */
export function appointmentTypeSerializedFields(appointment_type: AppointmentTypeJoin) {
  return {
    appointment_type_price_cents: appointment_type?.price_cents ?? null,
    appointment_type_name: appointment_type?.name ?? null,
    appointment_type_duration_minutes: appointment_type?.duration_minutes ?? null,
  };
}
