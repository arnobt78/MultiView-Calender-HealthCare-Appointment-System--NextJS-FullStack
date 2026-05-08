/**
 * Appointment Assignees API (Prisma)
 * GET: List assignees, optional filter by appointment_id
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";

function serializeAssignee(a: {
  id: string;
  created_at: Date;
  appointment_id: string;
  user_id: string | null;
  user_type: string | null;
  invited_email: string | null;
  status: string | null;
  permission: string | null;
  invited_by_id: string | null;
}) {
  return {
    id: a.id,
    created_at: a.created_at?.toISOString?.(),
    appointment: a.appointment_id,
    user: a.user_id,
    user_type: a.user_type,
    invited_email: a.invited_email,
    status: a.status,
    // invitation_token is intentionally omitted — it is a secret used only in email links.
    permission: a.permission,
    invited_by: a.invited_by_id,
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

    // appointment_id is required to prevent a global dump of all assignee rows.
    if (!appointmentId) {
      return NextResponse.json({ error: "appointment_id query param is required" }, { status: 400 });
    }

    // Verify the caller owns the appointment or is an accepted assignee on it.
    const accessible = await prisma.appointment.findFirst({
      where: {
        id: appointmentId,
        OR: [
          { user_id: sessionUser.userId },
          {
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

    const assignees = await prisma.appointmentAssignee.findMany({
      where: { appointment_id: appointmentId },
      orderBy: { created_at: "desc" },
    });

    return NextResponse.json({
      assignees: assignees.map(serializeAssignee),
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    console.error("Error fetching appointment assignees:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
