/**
 * ICS Calendar Import
 * 
 * POST /api/calendar/import — import .ics file and create appointments
 */

import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { uploadMetaSchema } from "@/lib/schemas/upload";
import { zodBadRequest } from "@/lib/schemas/parse";
import { redis } from "@/lib/redis";

interface ParsedEvent {
  summary: string;
  dtstart: string;
  dtend: string;
  description?: string;
  location?: string;
}

/**
 * Simple ICS parser — extracts VEVENT components
 */
function parseICS(icsContent: string): ParsedEvent[] {
  const events: ParsedEvent[] = [];
  const eventBlocks = icsContent.split("BEGIN:VEVENT");

  for (let i = 1; i < eventBlocks.length; i++) {
    const block = eventBlocks[i].split("END:VEVENT")[0];
    const lines = block.split(/\r?\n/);

    const event: Partial<ParsedEvent> = {};

    for (const line of lines) {
      const [key, ...valueParts] = line.split(":");
      const value = valueParts.join(":").trim();
      const cleanKey = key.split(";")[0].trim(); // remove params like ;VALUE=DATE

      switch (cleanKey) {
        case "SUMMARY":
          event.summary = value.replace(/\\n/g, "\n").replace(/\\,/g, ",").replace(/\\\\/g, "\\");
          break;
        case "DTSTART":
          event.dtstart = parseICSDate(value);
          break;
        case "DTEND":
          event.dtend = parseICSDate(value);
          break;
        case "DESCRIPTION":
          event.description = value.replace(/\\n/g, "\n").replace(/\\,/g, ",").replace(/\\\\/g, "\\");
          break;
        case "LOCATION":
          event.location = value.replace(/\\n/g, "\n").replace(/\\,/g, ",").replace(/\\\\/g, "\\");
          break;
      }
    }

    if (event.summary && event.dtstart && event.dtend) {
      events.push(event as ParsedEvent);
    }
  }

  return events;
}

function parseICSDate(dateStr: string): string {
  // Handle YYYYMMDDTHHMMSSZ or YYYYMMDDTHHMMSS
  const clean = dateStr.replace(/[^0-9TZ]/g, "");
  if (clean.length >= 15) {
    const year = clean.substring(0, 4);
    const month = clean.substring(4, 6);
    const day = clean.substring(6, 8);
    const hour = clean.substring(9, 11);
    const minute = clean.substring(11, 13);
    const second = clean.substring(13, 15);
    const tz = clean.endsWith("Z") ? "Z" : "";
    return `${year}-${month}-${day}T${hour}:${minute}:${second}${tz}`;
  }
  // Date only: YYYYMMDD
  if (clean.length >= 8) {
    const year = clean.substring(0, 4);
    const month = clean.substring(4, 6);
    const day = clean.substring(6, 8);
    return `${year}-${month}-${day}T00:00:00Z`;
  }
  return dateStr;
}

export async function POST(request: NextRequest) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const parsedFile = uploadMetaSchema.safeParse({
      folder: undefined,
      size: file.size,
      name: file.name,
      type: file.type,
    });
    if (!parsedFile.success) {
      return zodBadRequest(parsedFile.error);
    }
    if (!file.name.toLowerCase().endsWith(".ics")) {
      return NextResponse.json({ error: "Only .ics files are supported" }, { status: 400 });
    }

    const content = await file.text();
    const events = parseICS(content);

    if (events.length === 0) {
      return NextResponse.json({ error: "No valid events found in ICS file" }, { status: 400 });
    }

    // Create appointments from events
    const created = await prisma.appointment.createMany({
      data: events.map((event) => ({
        title: event.summary,
        start: new Date(event.dtstart),
        end: new Date(event.dtend),
        notes: event.description || null,
        location: event.location || null,
        user_id: sessionUser.userId,
        status: "pending",
      })),
    });

    /*
     * Bust the server-side Redis overview cache so the newly imported
     * appointments are counted in the dashboard totals immediately.
     */
    void redis.invalidateDashboardOverview(sessionUser.userId);

    return NextResponse.json({
      success: true,
      imported: created.count,
      total: events.length,
    });
  } catch (error) {
    console.error("ICS import error:", error);
    return NextResponse.json({ error: "Failed to import calendar" }, { status: 500 });
  }
}
