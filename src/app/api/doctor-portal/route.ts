/**
 * GET /api/doctor-portal
 *
 * Single prefetch endpoint for the Doctor Portal SSR page.
 * Returns everything the doctor portal needs in one round-trip:
 *   - doctor profile (User row with extended fields)
 *   - today's appointments (sorted by start)
 *   - upcoming appointments (next 20 beyond today)
 *   - assigned patients (where primary_doctor_id = userId)
 *   - all global appointment types with is_enabled config for this doctor
 *   - raw config rows (for checkbox state in the type manager)
 *   - performance metrics (today/week/month counts, pending, done, overdue)
 *
 * RBAC: doctor role only — other roles receive 403.
 * Cache key: queryKeys.doctorPortal.all
 */

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { getUserRole, isDoctorRole } from "@/lib/rbac";
import { serializeAppointment, serializePatient } from "@/lib/serializers";
import {
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
} from "date-fns";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const role = await getUserRole(sessionUser.userId);
    if (!isDoctorRole(role)) {
      return NextResponse.json({ error: "Forbidden — doctor role required" }, { status: 403 });
    }

    const now = new Date();
    const todayStart = startOfDay(now);
    const todayEnd = endOfDay(now);
    const weekStart = startOfWeek(now, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);

    // Run all queries in parallel for performance
    const [
      doctor,
      todayAppts,
      upcomingAppts,
      patients,
      globalTypes,
      typeConfigs,
      metricToday,
      metricWeek,
      metricMonth,
      metricPending,
      metricDone,
      metricOverdue,
    ] = await Promise.all([
      // Doctor's own user row with extended fields
      prisma.user.findUnique({
        where: { id: sessionUser.userId },
        select: {
          id: true,
          email: true,
          display_name: true,
          image: true,
          role: true,
          specialty: true,
          bio: true,
          phone: true,
          license_number: true,
          department: true,
          consultation_fee: true,
          office_location: true,
          languages_spoken: true,
          years_of_experience: true,
          created_at: true,
        },
      }),
      // Today's appointments
      prisma.appointment.findMany({
        where: {
          owner_id: sessionUser.userId,
          start: { gte: todayStart, lte: todayEnd },
        },
        orderBy: { start: "asc" },
      }),
      // Upcoming: next 20 beyond today (not done)
      prisma.appointment.findMany({
        where: {
          owner_id: sessionUser.userId,
          start: { gt: todayEnd },
          status: { not: "done" },
        },
        orderBy: { start: "asc" },
        take: 20,
      }),
      // Patients assigned to this doctor
      prisma.patient.findMany({
        where: { primary_doctor_id: sessionUser.userId },
        orderBy: { firstname: "asc" },
        take: 50,
      }),
      // All active global appointment types
      prisma.appointmentType.findMany({
        where: { user_id: null, is_active: true },
        orderBy: { name: "asc" },
      }),
      // This doctor's config rows (is_enabled per global type)
      prisma.doctorAppointmentTypeConfig.findMany({
        where: { doctor_id: sessionUser.userId },
        select: {
          id: true,
          doctor_id: true,
          appointment_type_id: true,
          is_enabled: true,
          created_at: true,
        },
      }),
      // Metrics
      prisma.appointment.count({ where: { owner_id: sessionUser.userId, start: { gte: todayStart, lte: todayEnd } } }),
      prisma.appointment.count({ where: { owner_id: sessionUser.userId, start: { gte: weekStart, lte: weekEnd } } }),
      prisma.appointment.count({ where: { owner_id: sessionUser.userId, start: { gte: monthStart, lte: monthEnd } } }),
      prisma.appointment.count({ where: { owner_id: sessionUser.userId, status: "pending" } }),
      prisma.appointment.count({ where: { owner_id: sessionUser.userId, status: "done" } }),
      prisma.appointment.count({
        where: { owner_id: sessionUser.userId, end: { lt: now }, status: { not: "done" } },
      }),
    ]);

    if (!doctor) {
      return NextResponse.json({ error: "Doctor profile not found" }, { status: 404 });
    }

    // Build enabledTypes: merge config rows into global types list
    const configMap = new Map(
      typeConfigs.map((c) => [c.appointment_type_id, c.is_enabled])
    );
    const enabledTypes = globalTypes
      .filter((t) => configMap.get(t.id) !== false)
      .map((t) => ({
        id: t.id,
        created_at: t.created_at.toISOString(),
        user_id: t.user_id,
        name: t.name,
        description: t.description,
        duration_minutes: t.duration_minutes,
        buffer_before_minutes: t.buffer_before_minutes,
        buffer_after_minutes: t.buffer_after_minutes,
        slot_interval_minutes: t.slot_interval_minutes,
        minimum_notice_minutes: t.minimum_notice_minutes,
        is_telehealth: t.is_telehealth,
        color: t.color,
        icon: t.icon,
        is_active: t.is_active,
        is_enabled: configMap.get(t.id) ?? true,
      }));

    const allGlobalTypes = globalTypes.map((t) => ({
      id: t.id,
      created_at: t.created_at.toISOString(),
      user_id: t.user_id,
      name: t.name,
      description: t.description,
      duration_minutes: t.duration_minutes,
      buffer_before_minutes: t.buffer_before_minutes,
      buffer_after_minutes: t.buffer_after_minutes,
      slot_interval_minutes: t.slot_interval_minutes,
      minimum_notice_minutes: t.minimum_notice_minutes,
      is_telehealth: t.is_telehealth,
      color: t.color,
      icon: t.icon,
      is_active: t.is_active,
      is_enabled: configMap.get(t.id) ?? true,
    }));

    return NextResponse.json({
      doctor: {
        ...doctor,
        created_at: doctor.created_at.toISOString(),
      },
      todayAppointments: todayAppts.map(serializeAppointment),
      upcomingAppointments: upcomingAppts.map(serializeAppointment),
      patients: patients.map(serializePatient),
      enabledTypes,
      allGlobalTypes,
      typeConfigs: typeConfigs.map((c) => ({
        ...c,
        created_at: c.created_at.toISOString(),
      })),
      metrics: {
        today: metricToday,
        thisWeek: metricWeek,
        thisMonth: metricMonth,
        pending: metricPending,
        done: metricDone,
        overdue: metricOverdue,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
