/**
 * Calendar assignee helpers — owned list cap (CALENDAR_APPOINTMENTS_LIMIT) does not include
 * shared/invited rows; those IDs are resolved here and fetched in one batch request.
 */

import type { Appointment, AppointmentAssignee } from "@/types/types";

/** Accepted assignee appointment IDs not already present in the owned/patient-scoped list. */
export function resolveExtraAssignedAppointmentIds(
  ownedAppointments: Pick<Appointment, "id">[],
  assignees: AppointmentAssignee[],
  userId: string,
  userEmail?: string | null
): string[] {
  const ownedIds = new Set(ownedAppointments.map((a) => a.id));

  const assignedByUser = assignees.filter(
    (a) => a.user === userId && a.status === "accepted"
  );
  const assignedByEmail = userEmail
    ? assignees.filter((a) => a.invited_email === userEmail && a.status === "accepted")
    : [];

  const uniqueIds = [
    ...new Set([
      ...assignedByUser.map((a) => a.appointment),
      ...assignedByEmail.map((a) => a.appointment),
    ]),
  ].filter((id): id is string => !!id);

  return uniqueIds.filter((id) => !ownedIds.has(id));
}
