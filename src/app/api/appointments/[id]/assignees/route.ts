/**
 * Appointment Assignees by Appointment ID (Prisma)
 * GET: List assignees | POST: Add assignees | DELETE: Remove all assignees
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { isValidUUID } from "@/lib/validation";

type RouteContext = { params: Promise<{ id: string }> };

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
    permission: a.permission,
    invited_by: a.invited_by_id,
  };
}

export async function GET(req: NextRequest, context: RouteContext) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { id } = await context.params;
    if (!isValidUUID(id)) {
      return NextResponse.json({ error: "Invalid appointment ID format" }, { status: 400 });
    }

    // Scope to owner or accepted assignee — same pattern as POST/DELETE.
    const appointment = await prisma.appointment.findFirst({
      where: {
        id,
        OR: [
          { user_id: sessionUser.userId },
          {
            assignees: {
              some: { user_id: sessionUser.userId, status: "accepted" },
            },
          },
        ],
      },
      select: { id: true },
    });
    if (!appointment) {
      return NextResponse.json({ error: "Appointment not found or forbidden" }, { status: 403 });
    }

    const assignees = await prisma.appointmentAssignee.findMany({
      where: { appointment_id: id },
      orderBy: { created_at: "desc" },
    });
    return NextResponse.json({ assignees: assignees.map(serializeAssignee) });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest, context: RouteContext) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { id } = await context.params;
    if (!isValidUUID(id)) {
      return NextResponse.json({ error: "Invalid appointment ID format" }, { status: 400 });
    }

    const appointment = await prisma.appointment.findUnique({
      where: { id },
      select: { user_id: true },
    });
    if (!appointment || appointment.user_id !== sessionUser.userId) {
      return NextResponse.json({ error: "Appointment not found or forbidden" }, { status: 403 });
    }

    const { assignees } = await req.json();
    if (!Array.isArray(assignees) || assignees.length === 0) {
      return NextResponse.json({ error: "Assignees array is required" }, { status: 400 });
    }

    for (const assignee of assignees) {
      const userId = assignee.user_type === "users" ? assignee.user || null : null;
      await prisma.appointmentAssignee.create({
        data: {
          appointment_id: id,
          user_id: userId,
          user_type: assignee.user_type ?? null,
          invited_email: assignee.invited_email ?? null,
          status: assignee.status ?? "pending",
          permission: assignee.permission ?? "read",
          invited_by_id: sessionUser.userId,
        },
      });
    }
    return NextResponse.json({ message: "Assignees added successfully" });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, context: RouteContext) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { id } = await context.params;
    if (!isValidUUID(id)) {
      return NextResponse.json({ error: "Invalid appointment ID format" }, { status: 400 });
    }

    const appointment = await prisma.appointment.findUnique({
      where: { id },
      select: { user_id: true },
    });
    if (!appointment || appointment.user_id !== sessionUser.userId) {
      return NextResponse.json({ error: "Appointment not found or forbidden" }, { status: 403 });
    }

    await prisma.appointmentAssignee.deleteMany({
      where: { appointment_id: id },
    });
    return NextResponse.json({ message: "Assignees deleted successfully" });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
