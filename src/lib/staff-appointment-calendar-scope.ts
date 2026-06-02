/**
 * Staff calendar visibility — visits the user owns, treats, or is an accepted assignee on.
 * Used by GET /api/appointments, prefetch, doctor portal, export, sync, and search.
 */

import type { Prisma } from "@prisma/client";
import { isAdminRole } from "@/lib/rbac";

/** Accepted assignee match — mirrors GET /api/appointments?ids= RBAC. */
export function staffCalendarAcceptedAssigneeWhere(
  userId: string,
  userEmail?: string | null
): Prisma.AppointmentWhereInput {
  const email = userEmail?.trim();
  return {
    assignees: {
      some: {
        status: "accepted",
        OR: [
          { user_id: userId },
          ...(email ? [{ invited_email: email }] : []),
        ],
      },
    },
  };
}

/** OR branches: owner, treating physician, accepted assignee. */
export function staffCalendarVisibilityOrClauses(
  userId: string,
  userEmail?: string | null
): Prisma.AppointmentWhereInput[] {
  return [
    { owner_id: userId },
    { treating_physician_id: userId },
    staffCalendarAcceptedAssigneeWhere(userId, userEmail),
  ];
}

/** List/export/search base — owner OR treating OR accepted assignee. */
export function staffCalendarAppointmentWhere(
  userId: string,
  userEmail?: string | null
): Prisma.AppointmentWhereInput {
  return { OR: staffCalendarVisibilityOrClauses(userId, userEmail) };
}

/** Merge staff scope with list filters (status, date range, category). */
export function staffCalendarAppointmentFilter(
  userId: string,
  extra?: Prisma.AppointmentWhereInput,
  userEmail?: string | null
): Prisma.AppointmentWhereInput {
  const base = staffCalendarAppointmentWhere(userId, userEmail);
  if (!extra || Object.keys(extra).length === 0) return base;
  return { AND: [base, extra] };
}

/** Single-row guard — sync POST, search by id. */
export function staffCalendarAppointmentByIdWhere(
  userId: string,
  appointmentId: string,
  userEmail?: string | null
): Prisma.AppointmentWhereInput {
  return {
    id: appointmentId,
    OR: staffCalendarVisibilityOrClauses(userId, userEmail),
  };
}

/** Calendar assignee batch — `GET /api/appointments?ids=` + SSR assigned-row fetch. */
export function staffCalendarAppointmentIdsBatchWhere(
  userId: string,
  ids: string[],
  userEmail?: string | null
): Prisma.AppointmentWhereInput {
  return {
    id: { in: ids },
    OR: staffCalendarVisibilityOrClauses(userId, userEmail),
  };
}

/** Dashboard overview appointment KPIs — admin sees all rows; doctors/staff see staff scope. */
export function dashboardOverviewAppointmentFilter(
  userId: string,
  role: string | null,
  extra?: Prisma.AppointmentWhereInput,
  userEmail?: string | null
): Prisma.AppointmentWhereInput {
  if (isAdminRole(role)) {
    if (!extra || Object.keys(extra).length === 0) return {};
    return extra;
  }
  return staffCalendarAppointmentFilter(userId, extra, userEmail);
}
