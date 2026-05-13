/**
 * Appointment by ID: GET, PUT, PATCH, DELETE (Prisma)
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { isValidUUID } from "@/lib/validation";
import { serializeAppointment } from "@/lib/serializers";
import { getUserRole, isPatientRole } from "@/lib/rbac";
import { redis } from "@/lib/redis";
import { format } from "date-fns";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, context: RouteContext) {
  try {
    // Require authentication — appointment data is user-private.
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    if (!isValidUUID(id)) {
      return NextResponse.json({ error: "Invalid appointment ID format" }, { status: 400 });
    }

    // Scope to the session user's own appointments or those where they are an accepted assignee.
    const appointment = await prisma.appointment.findFirst({
      where: {
        id,
        OR: [
          { owner_id: sessionUser.userId },
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
    });
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
    if (body.attachments !== undefined) data.attachments = body.attachments ?? [];
    if (body.treating_physician !== undefined) {
      const v = body.treating_physician as unknown;
      if (v === null || v === "") {
        data.treating_physician_id = null;
      } else if (typeof v === "string" && isValidUUID(v)) {
        const u = await prisma.user.findUnique({ where: { id: v }, select: { id: true } });
        if (!u) {
          return NextResponse.json({ error: "treating_physician user not found" }, { status: 400 });
        }
        data.treating_physician_id = v;
      } else {
        return NextResponse.json({ error: "Invalid treating_physician" }, { status: 400 });
      }
    }

    const appointment = await prisma.appointment.updateMany({
      where: { id, owner_id: sessionUser.userId },
      data,
    });

    if (appointment.count === 0) {
      return NextResponse.json({ error: "Appointment not found or unauthorized" }, { status: 404 });
    }
    const updated = await prisma.appointment.findUnique({ where: { id } });
    if (!updated) return NextResponse.json({ error: "Appointment not found" }, { status: 404 });


    /* Bust the server-side Redis overview cache so status/count changes reflect immediately. */
    void redis.invalidateDashboardOverview(sessionUser.userId);

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
      attachments?: string[];
      category_id?: string | null;
      notes?: string | null;
      status?: string | null;
      /** B2: optional FK; `null` clears explicit treating (display falls back to calendar owner). */
      treating_physician_id?: string | null;
      appointment_type_id?: string | null;
      is_telehealth?: boolean;
      chief_complaint?: string | null;
      duration_minutes?: number | null;
      telehealth_link?: string | null;
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
    if (body.attachments !== undefined) data.attachments = body.attachments;
    if (body.category !== undefined) data.category_id = body.category;
    if (body.notes !== undefined) data.notes = body.notes;
    if (body.status !== undefined) data.status = body.status;
    if (body.chief_complaint !== undefined) data.chief_complaint = body.chief_complaint ?? null;
    if (body.duration_minutes !== undefined) data.duration_minutes = body.duration_minutes ?? null;
    if (body.telehealth_link !== undefined) data.telehealth_link = body.telehealth_link ?? null;
    // appointment_type_id: resolve is_telehealth from the new type when switching types
    if (body.appointment_type_id !== undefined) {
      const typeId = body.appointment_type_id as unknown;
      if (typeId === null || typeId === "") {
        data.appointment_type_id = null;
        data.is_telehealth = false;
      } else if (typeof typeId === "string" && isValidUUID(typeId)) {
        const apptType = await prisma.appointmentType.findUnique({
          where: { id: typeId },
          select: { is_telehealth: true },
        });
        data.appointment_type_id = typeId;
        data.is_telehealth = apptType?.is_telehealth ?? false;
      } else {
        return NextResponse.json({ error: "Invalid appointment_type_id" }, { status: 400 });
      }
    }
    // B2: `treating_physician` mirrors `patient` / `category` wire names (UUID or null to clear).
    if (body.treating_physician !== undefined) {
      const v = body.treating_physician as unknown;
      if (v === null || v === "") {
        data.treating_physician_id = null;
      } else if (typeof v === "string" && isValidUUID(v)) {
        const u = await prisma.user.findUnique({ where: { id: v }, select: { id: true } });
        if (!u) {
          return NextResponse.json({ error: "treating_physician user not found" }, { status: 400 });
        }
        data.treating_physician_id = v;
      } else {
        return NextResponse.json({ error: "Invalid treating_physician" }, { status: 400 });
      }
    }

    if (Object.keys(data).length <= 1) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 });
    }

    const result = await prisma.appointment.updateMany({
      where: { id, owner_id: sessionUser.userId },
      data,
    });

    if (result.count === 0) {
      return NextResponse.json({ error: "Appointment not found or unauthorized" }, { status: 404 });
    }
    const updated = await prisma.appointment.findUnique({ where: { id } });
    if (!updated) return NextResponse.json({ error: "Appointment not found" }, { status: 404 });

    /* Bust the server-side Redis overview cache so status/count changes reflect immediately. */
    void redis.invalidateDashboardOverview(sessionUser.userId);

    /*
     * Notify only on status changes — status toggles (done / alert / pending) are the most
     * meaningful PATCH events. General field edits (title, time, notes) are not notified to
     * avoid noise.
     * Awaited inside try/catch: ensures the notification row is committed before the
     * response returns, so the client's immediate invalidateNotificationsData refetch
     * sees it. A notification failure never breaks the main PATCH response.
     */
    const statusMessages: Record<string, string> = {
      done: "marked as completed",
      alert: "flagged as alert",
      pending: "set back to pending",
    };
    if (body.status !== undefined && updated.status) {
      const statusLabel = statusMessages[updated.status] ?? updated.status;
      try {
        await prisma.notification.create({
          data: {
            user_id: sessionUser.userId,
            title: "Appointment Status Updated",
            message: `"${updated.title}" was ${statusLabel} — ${format(updated.start, "dd.MM.yyyy")}`,
            type: "status_update",
            // Deep-link to the updated appointment detail.
            link: `/control-panel/appointments/${updated.id}`,
          },
        });
      } catch {
        // Notification failure is non-critical — swallow silently.
      }
    }

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
      where: { id, owner_id: sessionUser.userId },
    });

    if (result.count === 0) {
      return NextResponse.json({ error: "Appointment not found or unauthorized" }, { status: 404 });
    }

    /* Bust the server-side Redis overview cache so the removed appointment is not counted. */
    void redis.invalidateDashboardOverview(sessionUser.userId);

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
