/**
 * GET /api/availability/dates?doctorId=&typeId=|flexDurationMinutes=&month=YYYY-MM&excludeAppointmentId=
 * Month day status for cal.com-style date picker (open / full / unavailable).
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { getBookableDatesInMonth } from "@/lib/scheduling/availability-slot-grid";
import { parseAvailabilityDatesQuery } from "@/lib/scheduling/availability-api-query";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const parsed = parseAvailabilityDatesQuery(new URL(req.url).searchParams);
    if (!parsed.ok) {
      return NextResponse.json({ error: parsed.error }, { status: parsed.status });
    }

    const { days, timezone } = await getBookableDatesInMonth(prisma, {
      doctorId: parsed.doctorId,
      monthYm: parsed.monthYm,
      schedulingScope: parsed.schedulingScope,
      excludeAppointmentId: parsed.excludeAppointmentId,
    });

    return NextResponse.json({ days, timezone });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
