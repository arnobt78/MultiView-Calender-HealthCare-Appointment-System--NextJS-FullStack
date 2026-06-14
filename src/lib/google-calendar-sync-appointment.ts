/**
 * Server-side push/upsert — shared by POST /api/calendar/sync and appointment CRUD auto-sync.
 */

import { prisma } from "@/lib/prisma";
import {
  appointmentToGoogleEvent,
  deleteGoogleEvent,
  getValidAccessToken,
  insertGoogleEvent,
  updateGoogleEvent,
} from "@/lib/google-calendar";

export type GoogleCalendarSyncAppointmentRow = {
  id: string;
  title: string;
  notes: string | null;
  start: Date;
  end: Date;
  location: string | null;
  status: string | null;
  google_calendar_event_id: string | null;
};

/** True when PATCH/PUT body touches fields mirrored to Google Calendar. */
export function shouldSyncAppointmentPatchToGoogle(body: Record<string, unknown>): boolean {
  return (
    body.title !== undefined ||
    body.start !== undefined ||
    body.end !== undefined ||
    body.location !== undefined ||
    body.notes !== undefined
  );
}

/** True when status transitions into cancelled (cancel flow). */
export function isAppointmentNewlyCancelled(
  previousStatus: string | null | undefined,
  newStatus: string | null | undefined
): boolean {
  return newStatus === "cancelled" && previousStatus !== "cancelled";
}

async function resolveGoogleAccessToken(userId: string): Promise<{
  accessToken: string;
  calendarId: string;
} | null> {
  const tokenRecord = await prisma.googleCalendarToken.findUnique({
    where: { user_id: userId },
  });
  if (!tokenRecord) return null;

  const accessToken = await getValidAccessToken(
    tokenRecord.access_token,
    tokenRecord.refresh_token,
    tokenRecord.expiry_date,
    async (newToken, newExpiry) => {
      await prisma.googleCalendarToken.update({
        where: { user_id: userId },
        data: { access_token: newToken, expiry_date: newExpiry, updated_at: new Date() },
      });
    }
  );

  return {
    accessToken,
    calendarId: tokenRecord.calendar_id || "primary",
  };
}

/**
 * Push/upsert one appointment to the connector's Google Calendar.
 * Non-throwing — returns Google event id or null on skip/failure.
 */
export async function syncAppointmentToGoogleCalendar(
  userId: string,
  appointment: GoogleCalendarSyncAppointmentRow
): Promise<string | null> {
  try {
    if (appointment.status === "cancelled") return null;

    const auth = await resolveGoogleAccessToken(userId);
    if (!auth) return null;

    const payload = appointmentToGoogleEvent({
      title: appointment.title,
      notes: appointment.notes,
      start: appointment.start.toISOString(),
      end: appointment.end.toISOString(),
      location: appointment.location,
    });

    let googleEventId = appointment.google_calendar_event_id?.trim() || null;

    if (googleEventId) {
      try {
        const updated = await updateGoogleEvent(
          auth.accessToken,
          auth.calendarId,
          googleEventId,
          payload
        );
        googleEventId = updated.id ?? googleEventId;
      } catch {
        const created = await insertGoogleEvent(auth.accessToken, auth.calendarId, payload);
        googleEventId = created.id ?? null;
      }
    } else {
      const created = await insertGoogleEvent(auth.accessToken, auth.calendarId, payload);
      googleEventId = created.id ?? null;
    }

    if (googleEventId && googleEventId !== appointment.google_calendar_event_id) {
      await prisma.appointment.update({
        where: { id: appointment.id },
        data: { google_calendar_event_id: googleEventId },
      });
    }

    return googleEventId;
  } catch (error: unknown) {
    console.error("syncAppointmentToGoogleCalendar error:", error);
    return null;
  }
}

/** Remove remote Google event only — non-blocking. */
export async function deleteGoogleCalendarEventForAppointment(
  userId: string,
  googleEventId: string | null | undefined
): Promise<void> {
  try {
    const eventId = googleEventId?.trim();
    if (!eventId) return;

    const auth = await resolveGoogleAccessToken(userId);
    if (!auth) return;

    await deleteGoogleEvent(auth.accessToken, auth.calendarId, eventId);
  } catch (error: unknown) {
    console.error("deleteGoogleCalendarEventForAppointment error:", error);
  }
}

/**
 * Delete remote Google event and clear local link — used on cancel/delete.
 * Non-throwing; local row may still exist after cancel.
 */
export async function unlinkAppointmentFromGoogleCalendar(
  userId: string,
  appointmentId: string,
  googleEventId: string | null | undefined
): Promise<void> {
  try {
    const eventId = googleEventId?.trim();
    if (!eventId) return;

    await deleteGoogleCalendarEventForAppointment(userId, eventId);
    await prisma.appointment.update({
      where: { id: appointmentId },
      data: { google_calendar_event_id: null },
    });
  } catch (error: unknown) {
    console.error("unlinkAppointmentFromGoogleCalendar error:", error);
  }
}

/**
 * Unified Google Calendar side-effects after appointment PATCH/PUT.
 * Cancel → unlink remote event; field changes on active visit → upsert.
 */
export async function runAppointmentGoogleCalendarSideEffects(
  userId: string,
  body: Record<string, unknown>,
  previousStatus: string | null | undefined,
  updated: GoogleCalendarSyncAppointmentRow
): Promise<void> {
  try {
    if (
      isAppointmentNewlyCancelled(previousStatus, updated.status) &&
      updated.google_calendar_event_id?.trim()
    ) {
      await unlinkAppointmentFromGoogleCalendar(
        userId,
        updated.id,
        updated.google_calendar_event_id
      );
      return;
    }

    if (
      updated.status !== "cancelled" &&
      shouldSyncAppointmentPatchToGoogle(body)
    ) {
      await syncAppointmentToGoogleCalendar(userId, updated);
    }
  } catch {
    // Google sync failures must not block appointment update.
  }
}
