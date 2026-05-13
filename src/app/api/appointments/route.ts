/**
 * Appointments API Route Handler (Prisma)
 * GET: List appointments (filtered by user, optional filters) | POST: Create appointment
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { PAGINATION } from "@/lib/constants";
import { serializeAppointment } from "@/lib/serializers";
import { appointmentCreateSchema } from "@/lib/schemas/appointment";
import { zodBadRequest } from "@/lib/schemas/parse";
import { getUserRole, isPatientRole } from "@/lib/rbac";
import { redis } from "@/lib/redis";
import { format } from "date-fns";

export async function GET(req: NextRequest) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") ?? undefined;
    const category = searchParams.get("category") ?? undefined;
    const startDate = searchParams.get("start_date") ?? undefined;
    const endDate = searchParams.get("end_date") ?? undefined;
    // parseInt returns NaN on non-numeric input; clamp only after verifying it's finite.
    const rawLimit = Number.parseInt(searchParams.get("limit") ?? PAGINATION.DEFAULT_LIMIT.toString(), 10);
    const rawOffset = Number.parseInt(searchParams.get("offset") ?? "0", 10);
    const limit = Number.isFinite(rawLimit)
      ? Math.min(Math.max(rawLimit, 1), PAGINATION.MAX_LIMIT)
      : PAGINATION.DEFAULT_LIMIT;
    const offset = Number.isFinite(rawOffset) ? Math.max(rawOffset, 0) : 0;

    const callerRole = await getUserRole(sessionUser.userId);

    /*
     * Patients have appointments linked via `patient_id` (the doctor owns the row via `owner_id` / DB column `user_id`).
     * When the caller is a patient, resolve their patient record and filter by patient_id instead.
     */
    let where: Record<string, unknown>;
    if (isPatientRole(callerRole)) {
      const userRow = await prisma.user.findUnique({ where: { id: sessionUser.userId } });
      const patientRecord = userRow
        ? await prisma.patient.findFirst({ where: { email: userRow.email } })
        : null;

      if (!patientRecord) {
        return NextResponse.json({
          appointments: [],
          pagination: { limit, offset, total: 0, count: 0 },
        });
      }

      where = { patient_id: patientRecord.id } as Record<string, unknown>;
    } else {
      where = { owner_id: sessionUser.userId } as Record<string, unknown>;
    }

    if (status) where.status = status;
    if (category) where.category_id = category;
    if (startDate) where.start = { gte: new Date(startDate) };
    if (endDate) where.end = { lte: new Date(endDate) };

    const [appointments, total] = await Promise.all([
      prisma.appointment.findMany({
        where,
        orderBy: { start: "asc" },
        take: limit,
        skip: offset,
      }),
      prisma.appointment.count({ where }),
    ]);

    return NextResponse.json({
      appointments: appointments.map(serializeAppointment),
      pagination: { limit, offset, total, count: appointments.length },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const role = await getUserRole(sessionUser.userId);
    if (isPatientRole(role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const parsed = appointmentCreateSchema.safeParse(await req.json());
    if (!parsed.success) {
      return zodBadRequest(parsed.error);
    }

    const body = parsed.data;
    const startDate = new Date(body.start);
    const endDate = new Date(body.end);

    // Resolve telehealth flag from the linked appointment type (if provided)
    let isTelehealth = false;
    if (body.appointment_type_id) {
      const apptType = await prisma.appointmentType.findUnique({
        where: { id: body.appointment_type_id },
        select: { is_telehealth: true },
      });
      isTelehealth = apptType?.is_telehealth ?? false;
    }

    const appointment = await prisma.appointment.create({
      data: {
        title: body.title,
        start: startDate,
        end: endDate,
        location: body.location ?? null,
        patient_id: body.patient ?? null,
        category_id: body.category ?? null,
        notes: body.notes ?? null,
        status: body.status ?? null,
        attachments: body.attachments ?? [],
        owner_id: sessionUser.userId,
        treating_physician_id: body.treating_physician ?? sessionUser.userId,
        appointment_type_id: body.appointment_type_id ?? null,
        is_telehealth: isTelehealth,
        chief_complaint: body.chief_complaint ?? null,
        duration_minutes: body.duration_minutes ?? null,
        telehealth_link: body.telehealth_link ?? null,
      },
    });

    /*
     * Bust the server-side Redis overview cache so the next dashboard
     * fetch reflects the new appointment count immediately.
     */
    void redis.invalidateDashboardOverview(sessionUser.userId);

    /*
     * Create an in-app notification so the bell reflects the new appointment.
     * Awaited (not fire-and-forget) so the row exists in the DB before the
     * response is sent — otherwise the client's immediate invalidateNotificationsData
     * refetch races and returns before the notification is committed.
     * Wrapped in try/catch so a notification failure never breaks the main response.
     */
    try {
      // Notify the creator (admin/doctor) of the new appointment
      await prisma.notification.create({
        data: {
          user_id: sessionUser.userId,
          title: "Appointment Scheduled",
          message: `"${appointment.title}" on ${format(appointment.start, "dd.MM.yyyy 'at' HH:mm")}`,
          type: "appointment_created",
          link: `/control-panel/appointments/${appointment.id}`,
        },
      });

      /*
       * If the appointment has a patient_id, also notify the patient's user account.
       * Looks up Patient.email → User.id so the patient sees the bell notification.
       */
      if (appointment.patient_id) {
        const patientRow = await prisma.patient.findUnique({
          where: { id: appointment.patient_id },
          select: { email: true },
        });
        const patientUser = patientRow?.email
          ? await prisma.user.findFirst({ where: { email: patientRow.email } })
          : null;
        if (patientUser && patientUser.id !== sessionUser.userId) {
          await prisma.notification.create({
            data: {
              user_id: patientUser.id,
              title: "New Appointment Scheduled",
              message: `"${appointment.title}" on ${format(appointment.start, "dd.MM.yyyy 'at' HH:mm")}`,
              type: "appointment_created",
              link: `/patient-portal`,
            },
          });
        }
      }
    } catch {
      // Notification failures are non-critical — swallow silently.
    }

    return NextResponse.json({ appointment: serializeAppointment(appointment) });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
