/**
 * Google Calendar backfill API
 *
 * POST /api/calendar/backfill — push unsynced staff appointments to Google after connect.
 */

import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { backfillAppointmentsToGoogleCalendar } from "@/lib/google-calendar-backfill";

/** Per-request API handler (see api-route-dynamic.test.ts). */
export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const tokenRecord = await prisma.googleCalendarToken.findUnique({
      where: { user_id: sessionUser.userId },
      select: { user_id: true },
    });

    if (!tokenRecord) {
      return NextResponse.json(
        { error: "Google Calendar not connected", connected: false },
        { status: 404 }
      );
    }

    const summary = await backfillAppointmentsToGoogleCalendar(
      sessionUser.userId,
      sessionUser.email
    );

    return NextResponse.json({ connected: true, backfill: summary });
  } catch (error: unknown) {
    console.error("Google Calendar backfill error:", error);
    return NextResponse.json({ error: "Failed to backfill appointments" }, { status: 500 });
  }
}
