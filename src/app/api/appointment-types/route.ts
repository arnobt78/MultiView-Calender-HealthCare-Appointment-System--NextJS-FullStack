/**
 * GET /api/appointment-types?doctorId=<uuid>
 *
 * Returns appointment types for a specific doctor: their own types (user_id = doctorId)
 * plus any global types (user_id = null) shared across all doctors.
 * Used by the patient portal booking wizard so patients can see the type of visit
 * (e.g. "Initial Consultation – 60 min", "Follow-up – 30 min") before picking a time slot.
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { isValidUUID } from "@/lib/validation";

export async function GET(req: NextRequest) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const doctorId = searchParams.get("doctorId") ?? "";

    if (!isValidUUID(doctorId)) {
      return NextResponse.json({ error: "doctorId must be a valid UUID" }, { status: 400 });
    }

    // Return doctor-specific types first, then fall back to global (user_id = null) types
    const types = await prisma.appointmentType.findMany({
      where: {
        OR: [{ user_id: doctorId }, { user_id: null }],
      },
      orderBy: [
        // Doctor-owned types first, then globals
        { user_id: "desc" },
        { name: "asc" },
      ],
    });

    return NextResponse.json({ types });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
