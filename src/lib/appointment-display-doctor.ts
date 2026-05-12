/**
 * B2 — Single resolver for which `User.id` drives “treating / clinical” labels (snapshot, portal, lists).
 *
 * - `treating_physician_id`: optional FK on `Appointment` (PostgreSQL column added in migration `20260511120000_add_appointment_treating_physician`).
 * - Fallback: calendar row owner (`Appointment.owner_id` in Prisma, DB column `user_id`; serialized as `user_id` to clients).
 *
 * Calendar owner for sharing / ICS / notifications remains `user_id` on the API wire; this helper is display-only for “doctor” copy.
 */

export type AppointmentTreatingSource = {
  /** Calendar owner — API `user_id` (Prisma `owner_id`). */
  user_id: string;
  /** Optional explicit treating physician (`Appointment.treating_physician_id`). */
  treating_physician_id?: string | null;
};

/**
 * Returns the User id used for “who is the doctor on this appointment?” display (portal chip, snapshot column, etc.).
 */
export function resolveTreatingPhysicianUserId(appt: AppointmentTreatingSource): string {
  const t = appt.treating_physician_id?.trim();
  if (t) return t;
  return appt.user_id;
}
