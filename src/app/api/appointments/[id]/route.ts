/**
 * Appointment by ID: GET, PUT, PATCH, DELETE (Prisma)
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { isValidUUID } from "@/lib/validation";
import { serializeAppointment } from "@/lib/serializers";
import { getUserRole, isPatientRole } from "@/lib/rbac";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    if (!isValidUUID(id)) {
      return NextResponse.json({ error: "Invalid appointment ID format" }, { status: 400 });
    }

    const appointment = await prisma.appointment.findUnique({ where: { id } });
    if (!appointment) {
      return NextResponse.json({ error: "Appointment not found" }, { status: 404 });
    }
    return NextResponse.json({ appointment: serializeAppointment(appointment) });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, context: RouteContext) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const role = await getUserRole(sessionUser.userId);
    if (isPatientRole(role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await context.params;
    if (!isValidUUID(id)) {
      return NextResponse.json({ error: "Invalid appointment ID format" }, { status: 400 });
    }

    const body = await req.json();
    const data: Record<string, unknown> = { updated_at: new Date() };

    if (body.title !== undefined) data.title = body.title;
    if (body.start !== undefined) {
      const start = new Date(body.start);
      if (Number.isNaN(start.getTime())) {
        return NextResponse.json({ error: "Invalid start date" }, { status: 400 });
      }
      data.start = start;
    }
    if (body.end !== undefined) {
      const end = new Date(body.end);
      if (Number.isNaN(end.getTime())) {
        return NextResponse.json({ error: "Invalid end date" }, { status: 400 });
      }
      data.end = end;
    }
    if (body.location !== undefined) data.location = body.location ?? null;
    if (body.patient !== undefined) data.patient_id = body.patient ?? null;
    if (body.category !== undefined) data.category_id = body.category ?? null;
    if (body.notes !== undefined) data.notes = body.notes ?? null;
    if (body.status !== undefined) data.status = body.status ?? null;
    if (body.attachements !== undefined) data.attachements = body.attachements ?? [];

    const appointment = await prisma.appointment.updateMany({
      where: { id, user_id: sessionUser.userId },
      data,
    });

    if (appointment.count === 0) {
      return NextResponse.json({ error: "Appointment not found or unauthorized" }, { status: 404 });
    }
    const updated = await prisma.appointment.findUnique({ where: { id } });
    if (!updated) return NextResponse.json({ error: "Appointment not found" }, { status: 404 });
    return NextResponse.json({ appointment: serializeAppointment(updated) });
  } catch (err: unknown) {
    if (err && typeof err === "object" && "code" in err && err.code === "P2025") {
      return NextResponse.json({ error: "Appointment not found or unauthorized" }, { status: 404 });
    }
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, context: RouteContext) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const role = await getUserRole(sessionUser.userId);
    if (isPatientRole(role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await context.params;
    if (!isValidUUID(id)) {
      return NextResponse.json({ error: "Invalid appointment ID format" }, { status: 400 });
    }

    const body = await req.json();
    const data: {
      updated_at: Date;
      title?: string;
      start?: Date;
      end?: Date;
      location?: string | null;
      patient_id?: string | null;
      attachements?: string[];
      category_id?: string | null;
      notes?: string | null;
      status?: string | null;
    } = { updated_at: new Date() };
    if (body.title !== undefined) data.title = body.title;
    if (body.start !== undefined) {
      const start = new Date(body.start);
      if (Number.isNaN(start.getTime())) {
        return NextResponse.json({ error: "Invalid start date" }, { status: 400 });
      }
      data.start = start;
    }
    if (body.end !== undefined) {
      const end = new Date(body.end);
      if (Number.isNaN(end.getTime())) {
        return NextResponse.json({ error: "Invalid end date" }, { status: 400 });
      }
      data.end = end;
    }
    if (body.location !== undefined) data.location = body.location;
    if (body.patient !== undefined) data.patient_id = body.patient;
    if (body.attachements !== undefined) data.attachements = body.attachements;
    if (body.category !== undefined) data.category_id = body.category;
    if (body.notes !== undefined) data.notes = body.notes;
    if (body.status !== undefined) data.status = body.status;

    if (Object.keys(data).length <= 1) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 });
    }

    const result = await prisma.appointment.updateMany({
      where: { id, user_id: sessionUser.userId },
      data,
    });

    if (result.count === 0) {
      return NextResponse.json({ error: "Appointment not found or unauthorized" }, { status: 404 });
    }
    const updated = await prisma.appointment.findUnique({ where: { id } });
    if (!updated) return NextResponse.json({ error: "Appointment not found" }, { status: 404 });
    return NextResponse.json({ appointment: serializeAppointment(updated) });
  } catch (err: unknown) {
    if (err && typeof err === "object" && "code" in err && err.code === "P2025") {
      return NextResponse.json({ error: "Appointment not found or unauthorized" }, { status: 404 });
    }
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, context: RouteContext) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const role = await getUserRole(sessionUser.userId);
    if (isPatientRole(role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await context.params;
    if (!isValidUUID(id)) {
      return NextResponse.json({ error: "Invalid appointment ID format" }, { status: 400 });
    }

    const result = await prisma.appointment.deleteMany({
      where: { id, user_id: sessionUser.userId },
    });

    if (result.count === 0) {
      return NextResponse.json({ error: "Appointment not found or unauthorized" }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
