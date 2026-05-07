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
  } catch (error) {
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

    const body = await request.json();
    const { appointmentId } = body;

    if (!appointmentId) {
      return NextResponse.json({ error: "appointmentId is required" }, { status: 400 });
    }

    // Scope to the session user's own appointment — prevents syncing foreign data to someone's calendar.
    const appointment = await prisma.appointment.findFirst({
      where: { id: appointmentId, user_id: sessionUser.userId },
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
  } catch (error) {
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
  } catch (error) {
    console.error("Google Calendar disconnect error:", error);
    return NextResponse.json({ error: "Failed to disconnect" }, { status: 500 });
  }
}
