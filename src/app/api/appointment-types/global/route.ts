/**
 * GET /api/appointment-types/global
 *
 * Returns appointment types shared across all doctors (user_id = null).
 * Used by the /services page to render the "Appointment Services" section.
 */

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const types = await prisma.appointmentType.findMany({
      where: { user_id: null },
      orderBy: [{ duration_minutes: "asc" }, { name: "asc" }],
      select: {
        id: true,
        name: true,
        description: true,
        duration_minutes: true,
        slot_interval_minutes: true,
        minimum_notice_minutes: true,
      },
    });

    return NextResponse.json({ types });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
