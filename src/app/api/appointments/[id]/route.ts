/**
 * Appointment by ID: GET, PUT, PATCH, DELETE (Prisma)
 *
 * Access: `resolveAppointmentAccess` — admin views all; mutate only owner or assignee write|full.
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { isValidUUID } from "@/lib/validation";
import { serializeAppointment } from "@/lib/serializers";
import { getUserRole, isPatientRole } from "@/lib/rbac";
import { resolveAppointmentAccess } from "@/lib/appointment-access";
import { appointmentNotificationLink } from "@/lib/entity-routes";
import { redis } from "@/lib/redis";
import { format } from "date-fns";
import {
  AppointmentSchedulingConflictError,
  assertNoOwnerAppointmentOverlap,
} from "@/lib/scheduling/validate-appointment-window";
import { assertDoctorActiveForBooking, assertDoctorActiveForBookingUnlessCurrent, InactiveDoctorBookingError } from "@/lib/doctor-active-booking";

export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ id: string }> };

async function sessionWithRole() {
  const sessionUser = await getSessionUser();
  if (!sessionUser) return null;
  const role = await getUserRole(sessionUser.userId);
  return {
    sessionUser,
    accessSession: {
      userId: sessionUser.userId,
      email: sessionUser.email,
      role,
    },
  };
}

export async function GET(_req: NextRequest, context: RouteContext) {
  try {
    const ctx = await sessionWithRole();
    if (!ctx) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    if (!isValidUUID(id)) {
      return NextResponse.json({ error: "Invalid appointment ID format" }, { status: 400 });
    }

    const { level, raw } = await resolveAppointmentAccess(ctx.accessSession, id);
    if (level === "none" || !raw) {
      return NextResponse.json({ error: "Appointment not found" }, { status: 404 });
    }

    return NextResponse.json({ appointment: serializeAppointment(raw) });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, context: RouteContext) {
  try {
    const ctx = await sessionWithRole();
    if (!ctx) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (isPatientRole(ctx.accessSession.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await context.params;
    if (!isValidUUID(id)) {
      return NextResponse.json({ error: "Invalid appointment ID format" }, { status: 400 });
    }

    const { level } = await resolveAppointmentAccess(ctx.accessSession, id);
    if (level !== "mutate") {
      return NextResponse.json({ error: "Appointment not found or unauthorized" }, { status: 404 });
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
        const existing = await prisma.appointment.findUnique({
          where: { id },
          select: { treating_physician_id: true },
        });
        try {
          await assertDoctorActiveForBookingUnlessCurrent(v, existing?.treating_physician_id);
        } catch (e) {
          if (e instanceof InactiveDoctorBookingError) {
            return NextResponse.json({ error: e.message }, { status: 409 });
          }
          throw e;
        }
        data.treating_physician_id = v;
      } else {
        return NextResponse.json({ error: "Invalid treating_physician" }, { status: 400 });
      }
    }

    const updated = await prisma.appointment.update({
      where: { id },
      data,
    });

    void redis.invalidateDashboardOverview(ctx.sessionUser.userId);

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
    const ctx = await sessionWithRole();
    if (!ctx) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (isPatientRole(ctx.accessSession.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await context.params;
    if (!isValidUUID(id)) {
      return NextResponse.json({ error: "Invalid appointment ID format" }, { status: 400 });
    }

    const { level } = await resolveAppointmentAccess(ctx.accessSession, id);
    if (level !== "mutate") {
      return NextResponse.json({ error: "Appointment not found or unauthorized" }, { status: 404 });
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
    if (body.treating_physician !== undefined) {
      const v = body.treating_physician as unknown;
      if (v === null || v === "") {
        data.treating_physician_id = null;
      } else if (typeof v === "string" && isValidUUID(v)) {
        const u = await prisma.user.findUnique({ where: { id: v }, select: { id: true } });
        if (!u) {
          return NextResponse.json({ error: "treating_physician user not found" }, { status: 400 });
        }
        const existing = await prisma.appointment.findUnique({
          where: { id },
          select: { treating_physician_id: true },
        });
        try {
          await assertDoctorActiveForBookingUnlessCurrent(v, existing?.treating_physician_id);
        } catch (e) {
          if (e instanceof InactiveDoctorBookingError) {
            return NextResponse.json({ error: e.message }, { status: 409 });
          }
          throw e;
        }
        data.treating_physician_id = v;
      } else {
        return NextResponse.json({ error: "Invalid treating_physician" }, { status: 400 });
      }
    }

    if (Object.keys(data).length <= 1) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 });
    }

    if (data.start !== undefined || data.end !== undefined) {
      const existing = await prisma.appointment.findUnique({
        where: { id },
        select: { owner_id: true, start: true, end: true },
      });
      if (!existing) {
        return NextResponse.json({ error: "Appointment not found" }, { status: 404 });
      }
      const nextStart = data.start ?? existing.start;
      const nextEnd = data.end ?? existing.end;
      try {
        await assertNoOwnerAppointmentOverlap(prisma, {
          doctorId: existing.owner_id,
          start: nextStart,
          end: nextEnd,
          excludeAppointmentId: id,
        });
      } catch (e) {
        if (e instanceof AppointmentSchedulingConflictError) {
          return NextResponse.json({ error: e.message }, { status: 409 });
        }
        throw e;
      }
    }

    const previousStatus =
      body.status !== undefined
        ? (
            await prisma.appointment.findUnique({
              where: { id },
              select: { status: true },
            })
          )?.status
        : undefined;

    const updated = await prisma.appointment.update({
      where: { id },
      data,
    });

    if (
      body.status === "done" &&
      previousStatus !== "done" &&
      updated.status === "done"
    ) {
      const { maybeCreateDraftInvoiceForCompletedVisit } = await import(
        "@/lib/billing-auto-draft"
      );
      void maybeCreateDraftInvoiceForCompletedVisit(id, ctx.accessSession);
    }

    void redis.invalidateDashboardOverview(ctx.sessionUser.userId);

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
            user_id: ctx.sessionUser.userId,
            title: "Appointment Status Updated",
            message: `"${updated.title}" was ${statusLabel} — ${format(updated.start, "dd.MM.yyyy")}`,
            type: "status_update",
            link: appointmentNotificationLink(ctx.accessSession.role, updated.id),
          },
        });
      } catch {
        /* notification failure is non-critical */
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

export async function DELETE(_req: NextRequest, context: RouteContext) {
  try {
    const ctx = await sessionWithRole();
    if (!ctx) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (isPatientRole(ctx.accessSession.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await context.params;
    if (!isValidUUID(id)) {
      return NextResponse.json({ error: "Invalid appointment ID format" }, { status: 400 });
    }

    const { level } = await resolveAppointmentAccess(ctx.accessSession, id);
    if (level !== "mutate") {
      return NextResponse.json({ error: "Appointment not found or unauthorized" }, { status: 404 });
    }

    await prisma.appointment.delete({ where: { id } });

    void redis.invalidateDashboardOverview(ctx.sessionUser.userId);

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
