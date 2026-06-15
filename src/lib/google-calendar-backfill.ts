/**
 * Push existing HealthCal appointments to Google Calendar after OAuth connect.
 * Only rows in staff scope without a linked `google_calendar_event_id` are attempted.
 */

import { prisma } from "@/lib/prisma";
import { staffCalendarAppointmentWhere } from "@/lib/staff-appointment-calendar-scope";
import {
  syncAppointmentToGoogleCalendar,
  type GoogleCalendarSyncAppointmentRow,
} from "@/lib/google-calendar-sync-appointment";
import type { GoogleCalendarBackfillSummary } from "@/types/google-calendar";

const BACKFILL_SELECT = {
  id: true,
  title: true,
  notes: true,
  start: true,
  end: true,
  location: true,
  status: true,
  google_calendar_event_id: true,
} as const;

/** Appointments eligible for first-time Google push. */
export function appointmentsPendingGoogleBackfillWhere(
  userId: string,
  userEmail?: string | null
) {
  return {
    AND: [
      staffCalendarAppointmentWhere(userId, userEmail),
      { NOT: { status: "cancelled" } },
      {
        OR: [{ google_calendar_event_id: null }, { google_calendar_event_id: "" }],
      },
    ],
  };
}

/**
 * Bulk push unsynced appointments — non-throwing per row; returns counts for UI toast.
 */
export async function backfillAppointmentsToGoogleCalendar(
  userId: string,
  userEmail?: string | null
): Promise<GoogleCalendarBackfillSummary> {
  const summary: GoogleCalendarBackfillSummary = {
    attempted: 0,
    synced: 0,
    skipped: 0,
    failed: 0,
  };

  const token = await prisma.googleCalendarToken.findUnique({
    where: { user_id: userId },
    select: { user_id: true },
  });
  if (!token) {
    return summary;
  }

  const rows = await prisma.appointment.findMany({
    where: appointmentsPendingGoogleBackfillWhere(userId, userEmail),
    select: BACKFILL_SELECT,
    orderBy: { start: "asc" },
  });

  for (const row of rows) {
    if (row.status === "cancelled") {
      summary.skipped += 1;
      continue;
    }
    if (row.google_calendar_event_id?.trim()) {
      summary.skipped += 1;
      continue;
    }

    summary.attempted += 1;
    const googleEventId = await syncAppointmentToGoogleCalendar(
      userId,
      row as GoogleCalendarSyncAppointmentRow
    );
    if (googleEventId) {
      summary.synced += 1;
    } else {
      summary.failed += 1;
    }
  }

  return summary;
}
