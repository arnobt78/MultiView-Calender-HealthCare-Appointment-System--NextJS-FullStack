/**
 * Activities API (Prisma)
 * GET: List activities, optional filter by appointment_id
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";

function serializeActivity(a: {
  id: string;
  created_at: Date;
  created_by_id: string | null;
  appointment_id: string;
  type: string;
  content: string;
}) {
  return {
    id: a.id,
    created_at: a.created_at?.toISOString?.(),
    created_by: a.created_by_id,
    appointment: a.appointment_id,
    type: a.type,
    content: a.content,
  };
}

export async function GET(req: NextRequest) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const appointmentId = searchParams.get("appointment_id");

    const where = appointmentId ? { appointment_id: appointmentId } : {};

    const activities = await prisma.activity.findMany({
      where,
      orderBy: { created_at: "desc" },
    });

    return NextResponse.json({
      activities: activities.map(serializeActivity),
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    console.error("Error fetching activities:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
