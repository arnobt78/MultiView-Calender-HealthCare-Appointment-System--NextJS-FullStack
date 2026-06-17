/**
 * Dashboard appointment card menu — capability flags per role + owner/assignee permission.
 * Aligns with `resolveAppointmentAccess` / `appointment-access.ts`: patients read-only;
 * toggle needs write|full|owner; edit/delete need full|owner.
 */

import { Appointment, AppointmentAssignee } from "@/types/types";
import { getUserAppointmentPermission } from "@/lib/permissions";
import { isAdminRole, isPatientRole } from "@/lib/rbac";
import { canCancelAppointment } from "@/lib/appointment-cancel-access";

export type AppointmentMenuCapabilities = {
  canView: boolean;
  canToggleStatus: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canCancel: boolean;
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
  appointment: Pick<Appointment, "id" | "user_id"> & {
    treating_physician_id?: string | null;
    status?: string | null;
  };
  assignees?: AppointmentAssignee[];
  userId: string | null | undefined;
  userEmail: string | null | undefined;
  userRole: string | null | undefined;
}): AppointmentMenuCapabilities {
  const isTerminal =
    appointment.status === "done" || appointment.status === "cancelled";

  if (isPatientRole(userRole)) {
    return {
      canView: true,
      canToggleStatus: false,
      canEdit: false,
      canDelete: false,
      canCancel: false,
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
  const isTreating =
    !!userId && appointment.treating_physician_id === userId;
  const perm = ownerPerm ?? assigneePerm;

  const assigneeRows =
    assignees?.map((a) => ({
      user_id: a.user ?? null,
      invited_email: a.invited_email ?? null,
      status: a.status ?? null,
      permission: a.permission ?? null,
    })) ?? [];

  const canCancel =
    !isTerminal &&
    !!userId &&
    canCancelAppointment(
      { userId, email: userEmail ?? "", role: userRole ?? null },
      {
        owner_id: appointment.user_id,
        treating_physician_id: appointment.treating_physician_id ?? null,
        assignees: assigneeRows,
      }
    );

  return {
    canView: true,
    canToggleStatus:
      !isTerminal &&
      (isOwner || isTreating || perm === "owner" || perm === "full" || perm === "write"),
    canEdit:
      appointment.status !== "cancelled" &&
      (isOwner || isTreating || perm === "owner" || perm === "full"),
    canDelete: isOwner || isTreating || perm === "owner" || perm === "full",
    canCancel: canCancel || (isAdminRole(userRole) && !isTerminal),
  };
}
