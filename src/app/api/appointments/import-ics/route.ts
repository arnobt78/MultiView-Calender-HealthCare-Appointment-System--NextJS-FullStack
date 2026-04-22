/**
 * Import appointments from an .ics (iCalendar) file
 * POST: Accepts { content: string } (raw .ics file text), parses VEVENT blocks,
 *       creates appointments for the authenticated user.
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";

interface ParsedEvent {
  title: string;
  start: Date;
  end: Date;
  location?: string;
  notes?: string;
}

/** Parse a DTSTART/DTEND value string (with optional TZID param) into a Date */
function parseICSDate(raw: string): Date | null {
  // raw may include TZID param like: TZID=America/New_York:20240101T090000
  const colonIdx = raw.lastIndexOf(":");
  const val = colonIdx !== -1 ? raw.substring(colonIdx + 1).trim() : raw.trim();

  // DATE only: YYYYMMDD
  if (/^\d{8}$/.test(val)) {
    const year = parseInt(val.substring(0, 4), 10);
    const month = parseInt(val.substring(4, 6), 10) - 1;
    const day = parseInt(val.substring(6, 8), 10);
    return new Date(year, month, day, 0, 0, 0);
  }

  // DATETIME: YYYYMMDDTHHmmss[Z]
  const m = val.match(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})(Z?)$/);
  if (!m) return null;

  const [, y, mo, d, h, min, s, utc] = m;
  if (utc === "Z") {
    return new Date(
      Date.UTC(+y, +mo - 1, +d, +h, +min, +s)
    );
  }
  return new Date(+y, +mo - 1, +d, +h, +min, +s);
}

/** Unescape ICS text value (\\n → newline, \\, → comma, etc.) */
function unescapeICS(value: string): string {
  return value
    .replace(/\\n/gi, "\n")
    .replace(/\\,/g, ",")
    .replace(/\\;/g, ";")
    .replace(/\\\\/g, "\\");
}

/** Parse raw .ics content into a list of events */
function parseICS(content: string): ParsedEvent[] {
  // Normalize line endings, then unfold continuation lines (RFC 5545 §3.1)
  const unfolded = content
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/\n[ \t]/g, "");

  const lines = unfolded.split("\n");
  const events: ParsedEvent[] = [];
  let inEvent = false;
  let props: Record<string, string> = {};

  for (const line of lines) {
    if (line.trim() === "BEGIN:VEVENT") {
      inEvent = true;
      props = {};
    } else if (line.trim() === "END:VEVENT") {
      inEvent = false;

      // Extract values (property name is everything before first colon, may include params)
      const getSummary = props["SUMMARY"] ?? props["X-WR-CALNAME"] ?? "";
      const dtstart = props["DTSTART"] ?? "";
      const dtend = props["DTEND"] ?? "";
      const location = props["LOCATION"] ?? "";
      const description = props["DESCRIPTION"] ?? "";

      if (!getSummary || !dtstart) continue;

      const startDate = parseICSDate(dtstart);
      let endDate = dtend ? parseICSDate(dtend) : null;

      if (!startDate) continue;

      // If no DTEND, default to 1 hour after start
      if (!endDate || endDate <= startDate) {
        endDate = new Date(startDate.getTime() + 60 * 60 * 1000);
      }

      events.push({
        title: unescapeICS(getSummary).substring(0, 255),
        start: startDate,
        end: endDate,
        location: location ? unescapeICS(location).substring(0, 255) : undefined,
        notes: description ? unescapeICS(description).substring(0, 2000) : undefined,
      });
    } else if (inEvent) {
      const colonIdx = line.indexOf(":");
      if (colonIdx === -1) continue;
      // Property name is everything before first colon, strip any ;PARAMS
      const propName = line.substring(0, colonIdx).split(";")[0].toUpperCase();
      const propValue = line.substring(colonIdx + 1);
      props[propName] = propValue;
    }
  }

  return events;
}

export async function POST(req: NextRequest) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const content: string = body?.content ?? "";

    if (!content || typeof content !== "string") {
      return NextResponse.json(
        { error: "Missing .ics file content" },
        { status: 400 }
      );
    }

    if (content.length > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 5 MB." },
        { status: 400 }
      );
    }

    if (!content.includes("BEGIN:VCALENDAR")) {
      return NextResponse.json(
        { error: "Invalid .ics file. Missing BEGIN:VCALENDAR." },
        { status: 400 }
      );
    }

    const events = parseICS(content);

    if (events.length === 0) {
      return NextResponse.json(
        { error: "No valid events found in the .ics file." },
        { status: 400 }
      );
    }

    // Batch-create appointments
    const created = await prisma.$transaction(
      events.map((ev) =>
        prisma.appointment.create({
          data: {
            title: ev.title,
            start: ev.start,
            end: ev.end,
            location: ev.location ?? null,
            notes: ev.notes ?? null,
            status: null,
            attachements: [],
            user_id: sessionUser.userId,
          },
        })
      )
    );

    return NextResponse.json({
      imported: created.length,
      message: `Successfully imported ${created.length} appointment${created.length !== 1 ? "s" : ""}.`,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
