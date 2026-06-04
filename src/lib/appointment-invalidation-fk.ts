/**
 * Explicit appointment FK ids for `invalidateAfterAppointmentMutation` — avoids relying
 * solely on `queryKeys.appointments.all` cache hits after PATCH/DELETE.
 */
import type { AppointmentMutationInvalidationOpts } from "@/lib/appointment-mutation-invalidation";

export type AppointmentDoctorFkSource = {
  user_id?: string | null;
  treating_physician_id?: string | null;
};

/** Map serialized appointment row → owner + treating physician invalidation opts. */
export function appointmentDoctorFkOpts(
  row: AppointmentDoctorFkSource | null | undefined
): Pick<AppointmentMutationInvalidationOpts, "ownerId" | "treatingPhysicianId"> {
  if (!row) return {};
  return {
    ownerId: row.user_id ?? null,
    treatingPhysicianId: row.treating_physician_id ?? null,
  };
}

/** Merge current + previous FK ids for appointment update/delete invalidation. */
export function appointmentDoctorFkOptsWithPrevious(
  current: AppointmentDoctorFkSource | null | undefined,
  previous: AppointmentDoctorFkSource | null | undefined
): Pick<
  AppointmentMutationInvalidationOpts,
  "ownerId" | "treatingPhysicianId" | "previousOwnerId" | "previousTreatingPhysicianId"
> {
  const now = appointmentDoctorFkOpts(current);
  const prev = appointmentDoctorFkOpts(previous);
  return {
    ownerId: now.ownerId,
    treatingPhysicianId: now.treatingPhysicianId,
    previousOwnerId: prev.ownerId,
    previousTreatingPhysicianId: prev.treatingPhysicianId,
  };
}
