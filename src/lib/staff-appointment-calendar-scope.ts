/**
 * Staff calendar visibility — visits the user owns OR treats.
 * Aligns /dashboard, doctor portal schedule, and GET /api/appointments with insights + billing scope.
 * Assignee-only visits still load via the assignee batch in prefetchDashboardAppointments.
 */

import type { Prisma } from "@prisma/client";
import { isAdminRole } from "@/lib/rbac";

/** Base OR clause: calendar owner (DB `user_id`) or treating physician. */
export function staffCalendarAppointmentWhere(
  userId: string
): Prisma.AppointmentWhereInput {
  return {
    OR: [{ owner_id: userId }, { treating_physician_id: userId }],
  };
}

/** Merge staff scope with list filters (status, date range, category). */
export function staffCalendarAppointmentFilter(
  userId: string,
  extra?: Prisma.AppointmentWhereInput
): Prisma.AppointmentWhereInput {
  const base = staffCalendarAppointmentWhere(userId);
  if (!extra || Object.keys(extra).length === 0) return base;
  return { AND: [base, extra] };
}

/** Single-row guard — export, Google sync POST, search by id (owner OR treating). */
export function staffCalendarAppointmentByIdWhere(
  userId: string,
  appointmentId: string
): Prisma.AppointmentWhereInput {
  return {
    id: appointmentId,
    OR: [{ owner_id: userId }, { treating_physician_id: userId }],
  };
}

/** Dashboard overview appointment KPIs — admin sees all rows; doctors/staff see owner OR treating. */
export function dashboardOverviewAppointmentFilter(
  userId: string,
  role: string | null,
  extra?: Prisma.AppointmentWhereInput
): Prisma.AppointmentWhereInput {
  if (isAdminRole(role)) {
    if (!extra || Object.keys(extra).length === 0) return {};
    return extra;
  }
  return staffCalendarAppointmentFilter(userId, extra);
}
