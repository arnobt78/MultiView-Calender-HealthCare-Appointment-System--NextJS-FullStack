/**
 * Dashboard overview — “Recently Created & Updated” queue: activity time, kind, sort.
 */

import type { Prisma } from "@prisma/client";
import { APPOINTMENT_TYPE_CARD_SELECT } from "@/lib/appointment-type-include";

/** Rows fetched before in-memory sort by latest create/update activity. */
export const DASHBOARD_RECENT_ACTIVITY_FETCH_CAP = 40;

export const DASHBOARD_RECENT_ACTIVITY_LIMIT = 5;

/** Minimum delta (ms) between created_at and updated_at to treat row as “Updated”. */
const UPDATED_VS_CREATED_THRESHOLD_MS = 1_000;

export type DashboardAppointmentActivityKind = "created" | "updated";

export function resolveAppointmentActivityAt(row: {
  created_at: Date;
  updated_at: Date | null;
}): Date {
  const created = row.created_at.getTime();
  const updated = row.updated_at?.getTime() ?? created;
  return new Date(Math.max(created, updated));
}

export function resolveAppointmentActivityKind(row: {
  created_at: Date;
  updated_at: Date | null;
}): DashboardAppointmentActivityKind {
  if (!row.updated_at) return "created";
  const delta = row.updated_at.getTime() - row.created_at.getTime();
  return delta > UPDATED_VS_CREATED_THRESHOLD_MS ? "updated" : "created";
}

/** Closest recent create/update first — used after capped Prisma fetch. */
export function pickRecentActivityAppointments<T extends { created_at: Date; updated_at: Date | null }>(
  rows: T[],
  limit: number = DASHBOARD_RECENT_ACTIVITY_LIMIT
): T[] {
  return [...rows]
    .sort(
      (a, b) =>
        resolveAppointmentActivityAt(b).getTime() - resolveAppointmentActivityAt(a).getTime()
    )
    .slice(0, limit);
}

/** Prisma select for recent-activity panel (includes owner as actor). */
export const dashboardOverviewRecentQueueSelect = {
  id: true,
  title: true,
  start: true,
  end: true,
  location: true,
  status: true,
  is_telehealth: true,
  duration_minutes: true,
  appointment_type: { select: APPOINTMENT_TYPE_CARD_SELECT },
  created_at: true,
  updated_at: true,
  patient: {
    select: {
      id: true,
      firstname: true,
      lastname: true,
      email: true,
      birth_date: true,
      care_level: true,
      clinical_profile: true,
    },
  },
  treating_physician: {
    select: {
      id: true,
      display_name: true,
      email: true,
      image: true,
      specialty: true,
      office_location: true,
    },
  },
  owner: {
    select: {
      id: true,
      display_name: true,
      email: true,
      image: true,
      specialty: true,
      office_location: true,
    },
  },
} satisfies Prisma.AppointmentSelect;
