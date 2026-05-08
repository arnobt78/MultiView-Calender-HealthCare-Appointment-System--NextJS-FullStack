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

    if (appointmentId) {
      // Appointment-scoped mode: verify the caller owns the appointment or is an accepted assignee.
      const accessible = await prisma.appointment.findFirst({
        where: {
          id: appointmentId,
          OR: [
            { user_id: sessionUser.userId },
            {
              // Prisma relation field on Appointment is "assignees" (@@map: appointment_assignee)
              assignees: {
                some: {
                  OR: [
                    { user_id: sessionUser.userId },
                    { invited_email: sessionUser.email },
                  ],
                  status: "accepted",
                },
              },
            },
          ],
        },
        select: { id: true },
      });

      if (!accessible) {
        return NextResponse.json({ error: "Appointment not found or forbidden" }, { status: 403 });
      }

      const activities = await prisma.activity.findMany({
        where: { appointment_id: appointmentId },
        orderBy: { created_at: "desc" },
      });
      return NextResponse.json({ activities: activities.map(serializeActivity) });
    }

    // Global activity-log mode (no appointment_id): returns activities authored by the session user.
    // Used by the "Activity Log" control-panel tab — scoped to created_by_id so only the
    // caller's own activity history is returned, never a global dump.
    const activities = await prisma.activity.findMany({
      where: { created_by_id: sessionUser.userId },
      orderBy: { created_at: "desc" },
      take: 200,
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
