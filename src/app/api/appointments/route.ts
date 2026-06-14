/**
 * Appointments API Route Handler (Prisma)
 * GET: List appointments (filtered by user, optional filters) | POST: Create appointment
 */

import { NextRequest, NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { PAGINATION } from "@/lib/constants";
import {
  APPOINTMENT_TYPE_CARD_SELECT,
  appointmentTypeSerializedFields,
} from "@/lib/appointment-type-include";
import { mapPortalAppointmentsFromRows, serializeAppointment } from "@/lib/serializers";
import { appointmentCreateSchema } from "@/lib/schemas/appointment";
import { zodBadRequest } from "@/lib/schemas/parse";
import {
  AppointmentSchedulingConflictError,
  assertNoOwnerAppointmentOverlap,
} from "@/lib/scheduling/validate-appointment-window";
import { getUserRole, isPatientRole } from "@/lib/rbac";
import {
  staffCalendarAppointmentFilter,
  staffCalendarAppointmentIdsBatchWhere,
} from "@/lib/staff-appointment-calendar-scope";
import { isValidUUID } from "@/lib/validation";
import { appointmentDetailHref, appointmentNotificationLink } from "@/lib/entity-routes";
import { buildAppointmentDetailApiPayload } from "@/lib/appointment-detail-api";
import { redis } from "@/lib/redis";
import { assertDoctorActiveForBooking, InactiveDoctorBookingError } from "@/lib/doctor-active-booking";
import { syncAppointmentToGoogleCalendar } from "@/lib/google-calendar-sync-appointment";
import { format } from "date-fns";
import { portalAppointmentListInclude } from "@/lib/portal-appointment-prisma-include";

export const dynamic = "force-dynamic";

/** Patient callers: same joins as GET /api/patient-portal for RBAC-safe staff labels on dashboard cards. */
const PATIENT_APPOINTMENT_INCLUDE = portalAppointmentListInclude;

/** All callers get appointment_type.price_cents + doctor consultation_fee for the visit fee badge fallback chain. */
const BASE_APPOINTMENT_INCLUDE = {
  appointment_type: { select: APPOINTMENT_TYPE_CARD_SELECT },
  treating_physician: { select: { consultation_fee: true } },
  owner: { select: { consultation_fee: true } },
} as const;

export async function GET(req: NextRequest) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const idsParam = searchParams.get("ids");

    /** Batch fetch for calendar assignee rows — RBAC filters to owner or accepted assignee. */
    if (idsParam) {
      const ids = idsParam
        .split(",")
        .map((s) => s.trim())
        .filter((id) => isValidUUID(id))
        .slice(0, PAGINATION.CALENDAR_ASSIGNED_BATCH_LIMIT);

      if (ids.length === 0) {
        return NextResponse.json({
          appointments: [],
          pagination: { limit: 0, offset: 0, total: 0, count: 0 },
        });
      }

      const rows = await prisma.appointment.findMany({
        where: staffCalendarAppointmentIdsBatchWhere(
          sessionUser.userId,
          ids,
          sessionUser.email
        ),
        orderBy: { start: "asc" },
        include: BASE_APPOINTMENT_INCLUDE,
      });

      return NextResponse.json({
        appointments: rows.map((a) => {
          const ta = a as typeof a & {
            appointment_type?: { price_cents: number; name?: string | null; duration_minutes?: number | null } | null;
            treating_physician?: { consultation_fee: number | null } | null;
            owner?: { consultation_fee: number | null } | null;
          };
          const feeDoc = ta.treating_physician ?? ta.owner;
          return serializeAppointment({
            ...a,
            ...appointmentTypeSerializedFields(ta.appointment_type),
            doctor_consultation_fee_cents: feeDoc?.consultation_fee ?? null,
          });
        }),
        pagination: {
          limit: ids.length,
          offset: 0,
          total: rows.length,
          count: rows.length,
        },
      });
    }

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
    const patientCaller = isPatientRole(callerRole);
    const listFilters: Prisma.AppointmentWhereInput = {
      ...(status ? { status } : {}),
      ...(category ? { category_id: category } : {}),
      ...(startDate ? { start: { gte: new Date(startDate) } } : {}),
      ...(endDate ? { end: { lte: new Date(endDate) } } : {}),
    };

    let where: Prisma.AppointmentWhereInput;

    if (patientCaller) {
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

      where = { patient_id: patientRecord.id, ...listFilters };
    } else {
      where = staffCalendarAppointmentFilter(
        sessionUser.userId,
        listFilters,
        sessionUser.email
      );
    }

    const [appointments, total] = await Promise.all([
      prisma.appointment.findMany({
        where,
        orderBy: { start: "asc" },
        take: limit,
        skip: offset,
        include: patientCaller ? PATIENT_APPOINTMENT_INCLUDE : BASE_APPOINTMENT_INCLUDE,
      }),
      prisma.appointment.count({ where }),
    ]);

    const serialized = patientCaller
      ? mapPortalAppointmentsFromRows(
          appointments as unknown as Parameters<typeof mapPortalAppointmentsFromRows>[0]
        )
      : appointments.map((a) => {
          const ta = a as typeof a & {
            appointment_type?: { price_cents: number; name?: string | null; duration_minutes?: number | null } | null;
            treating_physician?: { consultation_fee: number | null } | null;
            owner?: { consultation_fee: number | null } | null;
          };
          const feeDoc = ta.treating_physician ?? ta.owner;
          return serializeAppointment({
            ...a,
            ...appointmentTypeSerializedFields(ta.appointment_type),
            doctor_consultation_fee_cents: feeDoc?.consultation_fee ?? null,
          });
        });

    return NextResponse.json({
      appointments: serialized,
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

    const treatingId = body.treating_physician ?? sessionUser.userId;
    try {
      await assertDoctorActiveForBooking(treatingId);
    } catch (e) {
      if (e instanceof InactiveDoctorBookingError) {
        return NextResponse.json({ error: e.message }, { status: 409 });
      }
      throw e;
    }

    try {
      await assertNoOwnerAppointmentOverlap(prisma, {
        doctorId: sessionUser.userId,
        start: startDate,
        end: endDate,
      });
    } catch (e) {
      if (e instanceof AppointmentSchedulingConflictError) {
        return NextResponse.json({ error: e.message }, { status: 409 });
      }
      throw e;
    }

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
        created_by_id: sessionUser.userId,
        updated_by_id: sessionUser.userId,
        treating_physician_id: body.treating_physician ?? sessionUser.userId,
        appointment_type_id: body.appointment_type_id ?? null,
        is_telehealth: isTelehealth,
        chief_complaint: body.chief_complaint ?? null,
        duration_minutes: body.duration_minutes ?? null,
        telehealth_link: body.telehealth_link ?? null,
      },
      include: { appointment_type: { select: APPOINTMENT_TYPE_CARD_SELECT } },
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
          link: appointmentNotificationLink(role, appointment.id),
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
              link: appointmentDetailHref("patient", appointment.id),
            },
          });
        }
      }
    } catch {
      // Notification failures are non-critical — swallow silently.
    }

    try {
      await syncAppointmentToGoogleCalendar(sessionUser.userId, appointment);
    } catch {
      // Google sync failures must not block appointment create.
    }

    const accessSession = {
      userId: sessionUser.userId,
      email: sessionUser.email,
      role,
    };
    const payload = await buildAppointmentDetailApiPayload(accessSession, appointment.id);
    if (payload) {
      return NextResponse.json(payload);
    }

    return NextResponse.json({
      appointment: serializeAppointment({
        ...appointment,
        ...appointmentTypeSerializedFields(appointment.appointment_type),
        doctor_consultation_fee_cents: null,
      }),
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
