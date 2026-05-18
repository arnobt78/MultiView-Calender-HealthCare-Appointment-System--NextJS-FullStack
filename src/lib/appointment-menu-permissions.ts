/**
 * Dashboard appointment card menu — capability flags per role + owner/assignee permission.
 * Aligns with `resolveAppointmentAccess` / `appointment-access.ts`: patients read-only;
 * toggle needs write|full|owner; edit/delete need full|owner.
 */

import { Appointment, AppointmentAssignee } from "@/types/types";
import { getUserAppointmentPermission } from "@/lib/permissions";
import { isPatientRole } from "@/lib/rbac";

export type AppointmentMenuCapabilities = {
  canView: boolean;
  canToggleStatus: boolean;
  canEdit: boolean;
  canDelete: boolean;
};

/** Accepted assignee row matched by user id or invited email (email-aware). */
function resolveAssigneePermission(
  assignees: AppointmentAssignee[] | undefined,
  appointmentId: string,
  userId: string | null | undefined,
  userEmail: string | null | undefined
): "full" | "write" | "read" | null {
  if (!assignees?.length || (!userId && !userEmail)) return null;
  const row = assignees.find(
    (a) =>
      a.appointment === appointmentId &&
      a.status === "accepted" &&
      (a.user === userId || (!!userEmail && a.invited_email === userEmail))
  );
  return row?.permission ?? null;
}

/**
 * Four menu actions for list/hover cards — items always render; UI disables when false.
 */
export function getAppointmentMenuCapabilities({
  appointment,
  assignees,
  userId,
  userEmail,
  userRole,
}: {
  appointment: Pick<Appointment, "id" | "user_id">;
  assignees?: AppointmentAssignee[];
  userId: string | null | undefined;
  userEmail: string | null | undefined;
  userRole: string | null | undefined;
}): AppointmentMenuCapabilities {
  if (isPatientRole(userRole)) {
    return {
      canView: true,
      canToggleStatus: false,
      canEdit: false,
      canDelete: false,
    };
  }

  const ownerPerm = getUserAppointmentPermission({
    appointment: appointment as Appointment,
    assignees,
    userId,
  });
  const assigneePerm = resolveAssigneePermission(
    assignees,
    appointment.id,
    userId,
    userEmail
  );
  const isOwner = !!userId && appointment.user_id === userId;
  const perm = ownerPerm ?? assigneePerm;

  return {
    canView: true,
    canToggleStatus:
      isOwner || perm === "owner" || perm === "full" || perm === "write",
    canEdit: isOwner || perm === "owner" || perm === "full",
    canDelete: isOwner || perm === "owner" || perm === "full",
  };
}
