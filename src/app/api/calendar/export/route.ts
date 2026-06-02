/**
 * ICS Calendar Export
 * 
 * GET /api/calendar/export — export user's appointments as .ics file
 */

import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { staffCalendarAppointmentWhere } from "@/lib/staff-appointment-calendar-scope";

function escapeICS(text: string): string {
  return text.replace(/[\\;,\n]/g, (match) => {
    if (match === "\n") return "\\n";
    return `\\${match}`;
  });
}

function formatICSDate(date: Date): string {
  return date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

/** Per-request API handler (see api-route-dynamic.test.ts). */
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const appointments = await prisma.appointment.findMany({
      where: staffCalendarAppointmentWhere(sessionUser.userId),
      include: { category: true, patient: true },
      orderBy: { start: "desc" },
    });

    const now = formatICSDate(new Date());
    const lines: string[] = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//HealthCal Pro//EN",
      "CALSCALE:GREGORIAN",
      "METHOD:PUBLISH",
    ];

    for (const appt of appointments) {
      const uid = `${appt.id}@healthcalpro`;
      lines.push("BEGIN:VEVENT");
      lines.push(`UID:${uid}`);
      lines.push(`DTSTAMP:${now}`);
      lines.push(`DTSTART:${formatICSDate(appt.start)}`);
      lines.push(`DTEND:${formatICSDate(appt.end)}`);
      lines.push(`SUMMARY:${escapeICS(appt.title)}`);
      if (appt.notes) lines.push(`DESCRIPTION:${escapeICS(appt.notes)}`);
      if (appt.location) lines.push(`LOCATION:${escapeICS(appt.location)}`);
      if (appt.status) lines.push(`STATUS:${appt.status === "done" ? "CONFIRMED" : "TENTATIVE"}`);
      if (appt.category) lines.push(`CATEGORIES:${escapeICS(appt.category.label)}`);
      lines.push("END:VEVENT");
    }

    lines.push("END:VCALENDAR");

    const icsContent = lines.join("\r\n");

    return new NextResponse(icsContent, {
      status: 200,
      headers: {
        "Content-Type": "text/calendar; charset=utf-8",
        "Content-Disposition": 'attachment; filename="appointments.ics"',
      },
    });
  } catch (error: unknown) {
    console.error("ICS export error:", error);
    return NextResponse.json({ error: "Failed to export calendar" }, { status: 500 });
  }
}
