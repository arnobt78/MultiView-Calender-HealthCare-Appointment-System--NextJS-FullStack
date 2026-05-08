/**
 * Appointment Activities by Appointment ID (Prisma)
 * GET: List activities | POST: Add activities | DELETE: Remove all activities
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { isValidUUID } from "@/lib/validation";

type RouteContext = { params: Promise<{ id: string }> };

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

    // Scope to owner OR accepted assignee — same guard as the POST handler.
    const appointment = await prisma.appointment.findFirst({
      where: {
        id,
        OR: [
          { user_id: sessionUser.userId },
          {
            assignees: {
              some: {
                user_id: sessionUser.userId,
                status: "accepted",
              },
            },
          },
        ],
      },
      select: { id: true },
    });
    if (!appointment) {
      return NextResponse.json({ error: "Appointment not found or forbidden" }, { status: 403 });
    }

    const activities = await prisma.activity.findMany({
      where: { appointment_id: id },
      orderBy: { created_at: "desc" },
    });
    return NextResponse.json({ activities: activities.map(serializeActivity) });
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

    const { activities } = await req.json();
    if (!Array.isArray(activities) || activities.length === 0) {
      return NextResponse.json({ error: "Activities array is required" }, { status: 400 });
    }

    for (const activity of activities) {
      await prisma.activity.create({
        data: {
          appointment_id: id,
          type: activity.type ?? "note",
          content: activity.content ?? "",
          // Always attribute to the session user — never trust client-supplied created_by.
          created_by_id: sessionUser.userId,
        },
      });
    }
    return NextResponse.json({ message: "Activities added successfully" });
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

    await prisma.activity.deleteMany({
      where: { appointment_id: id },
    });
    return NextResponse.json({ message: "Activities deleted successfully" });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
