/**
 * Cancel appointment RBAC — broader than generic mutate (admin + treating physician).
 * Patients cannot cancel via API (read-only portal).
 */

import type { AppointmentAccessSession } from "@/lib/appointment-access";
import { isAdminRole, isPatientRole } from "@/lib/rbac";

type AssigneeRow = {
  user_id: string | null;
  invited_email: string | null;
  status: string | null;
  permission: string | null;
};

export type AppointmentCancelRow = {
  owner_id: string;
  treating_physician_id: string | null;
  assignees: AssigneeRow[];
};

function assigneeCanCancel(
  assignees: AssigneeRow[],
  userId: string,
  email: string
): boolean {
  return assignees.some(
    (a) =>
      a.status === "accepted" &&
      (a.user_id === userId || (email.length > 0 && a.invited_email === email)) &&
      (a.permission === "write" || a.permission === "full")
  );
}

/** True when session may PATCH `status: "cancelled"` for the loaded row. */
export function canCancelAppointment(
  session: AppointmentAccessSession,
  row: AppointmentCancelRow
): boolean {
  const { userId, email, role } = session;
  if (isPatientRole(role)) return false;
  if (isAdminRole(role)) return true;

  const isOwner = row.owner_id === userId;
  const isTreating = row.treating_physician_id === userId;
  return (
    isOwner || isTreating || assigneeCanCancel(row.assignees ?? [], userId, email)
  );
}
