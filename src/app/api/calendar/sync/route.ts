/**
 * Google Calendar Sync API
 * 
 * POST /api/calendar/sync — push a local appointment to Google Calendar
 * GET /api/calendar/sync — pull events from Google Calendar
 * DELETE /api/calendar/sync — disconnect Google Calendar
 */

import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import {
  getValidAccessToken,
  insertGoogleEvent,
  listGoogleEvents,
  appointmentToGoogleEvent,
} from "@/lib/google-calendar";
import { staffCalendarAppointmentByIdWhere } from "@/lib/staff-appointment-calendar-scope";

/** Per-request API handler (see api-route-dynamic.test.ts). */
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const tokenRecord = await prisma.googleCalendarToken.findUnique({
      where: { user_id: sessionUser.userId },
    });

    if (!tokenRecord) {
      return NextResponse.json({ error: "Google Calendar not connected", connected: false }, { status: 404 });
    }

    const accessToken = await getValidAccessToken(
      tokenRecord.access_token,
      tokenRecord.refresh_token,
      tokenRecord.expiry_date,
      async (newToken, newExpiry) => {
        await prisma.googleCalendarToken.update({
          where: { user_id: sessionUser.userId },
          data: { access_token: newToken, expiry_date: newExpiry, updated_at: new Date() },
        });
      }
    );

    const calendarId = tokenRecord.calendar_id || "primary";
    const events = await listGoogleEvents(accessToken, calendarId);

    return NextResponse.json({ events, connected: true });
  } catch (error: unknown) {
    console.error("Google Calendar sync GET error:", error);
    return NextResponse.json({ error: "Failed to fetch calendar events" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json() as { appointmentId?: unknown };
    const { appointmentId } = body;

    // Validate presence and UUID format before touching Prisma.
    if (!appointmentId || typeof appointmentId !== "string") {
      return NextResponse.json({ error: "appointmentId is required" }, { status: 400 });
    }
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(appointmentId)) {
      return NextResponse.json({ error: "Invalid appointmentId format" }, { status: 400 });
    }

    // Owner OR treating — same scope as GET /api/appointments and ICS export.
    const appointment = await prisma.appointment.findFirst({
      where: staffCalendarAppointmentByIdWhere(
        sessionUser.userId,
        appointmentId,
        sessionUser.email
      ),
    });

    if (!appointment) {
      return NextResponse.json({ error: "Appointment not found" }, { status: 404 });
    }

    // Get Google Calendar tokens
    const tokenRecord = await prisma.googleCalendarToken.findUnique({
      where: { user_id: sessionUser.userId },
    });

    if (!tokenRecord) {
      return NextResponse.json({ error: "Google Calendar not connected" }, { status: 400 });
    }

    const accessToken = await getValidAccessToken(
      tokenRecord.access_token,
      tokenRecord.refresh_token,
      tokenRecord.expiry_date,
      async (newToken, newExpiry) => {
        await prisma.googleCalendarToken.update({
          where: { user_id: sessionUser.userId },
          data: { access_token: newToken, expiry_date: newExpiry, updated_at: new Date() },
        });
      }
    );

    const calendarId = tokenRecord.calendar_id || "primary";
    const event = appointmentToGoogleEvent({
      title: appointment.title,
      notes: appointment.notes,
      start: appointment.start.toISOString(),
      end: appointment.end.toISOString(),
      location: appointment.location,
    });

    const created = await insertGoogleEvent(accessToken, calendarId, event);

    return NextResponse.json({ success: true, event: created });
  } catch (error: unknown) {
    console.error("Google Calendar sync POST error:", error);
    return NextResponse.json({ error: "Failed to sync appointment" }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await prisma.googleCalendarToken.deleteMany({
      where: { user_id: sessionUser.userId },
    });

    return NextResponse.json({ success: true, message: "Google Calendar disconnected" });
  } catch (error: unknown) {
    console.error("Google Calendar disconnect error:", error);
    return NextResponse.json({ error: "Failed to disconnect" }, { status: 500 });
  }
}
