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
  invitation_token: string | null;
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
    invitation_token: a.invitation_token,
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

    const where = appointmentId ? { appointment_id: appointmentId } : {};

    const assignees = await prisma.appointmentAssignee.findMany({
      where,
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
