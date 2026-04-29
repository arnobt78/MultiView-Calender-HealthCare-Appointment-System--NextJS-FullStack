/**
 * GET /api/availability/slots?doctorId=&date=YYYY-MM-DD&typeId=
 * Returns ISO slot start times for booking UI (Cal-style).
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { isValidUUID } from "@/lib/validation";
import { computeAvailabilitySlots } from "@/lib/availability-slots";

export async function GET(req: NextRequest) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const doctorId = searchParams.get("doctorId") ?? "";
    const dateStr = searchParams.get("date") ?? "";
    const typeId = searchParams.get("typeId") ?? "";

    if (!isValidUUID(doctorId) || !isValidUUID(typeId) || !dateStr) {
      return NextResponse.json(
        { error: "doctorId, date (YYYY-MM-DD), and typeId are required" },
        { status: 400 }
      );
    }

    const { slots, timezone } = await computeAvailabilitySlots(prisma, {
      doctorId,
      dateStr,
      typeId,
    });

    return NextResponse.json({ slots, timezone });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
