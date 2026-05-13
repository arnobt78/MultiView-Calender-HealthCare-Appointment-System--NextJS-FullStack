/**
 * GET /api/secretary-portal
 *
 * Single prefetch endpoint for the Secretary Portal SSR page.
 * Returns:
 *   - today's appointments (all, not scoped to secretary — secretaries manage the clinic's schedule)
 *   - upcoming appointments (next 20)
 *   - patient list (first 50, for quick lookup)
 *   - doctor directory (for appointment creation and patient routing)
 *   - recent activities (last 20 across all appointments)
 *   - metrics (today count, pending count, total patients, total doctors)
 *
 * RBAC: secretary role only — other roles receive 403.
 * Cache key: queryKeys.secretaryPortal.all
 */

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { getUserRole, isSecretaryRole } from "@/lib/rbac";
import { serializeAppointment, serializePatient } from "@/lib/serializers";
import { startOfDay, endOfDay } from "date-fns";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const role = await getUserRole(sessionUser.userId);
    if (!isSecretaryRole(role)) {
      return NextResponse.json({ error: "Forbidden — secretary role required" }, { status: 403 });
    }

    const now = new Date();
    const todayStart = startOfDay(now);
    const todayEnd = endOfDay(now);

    const [
      todayAppts,
      upcomingAppts,
      patients,
      doctors,
      recentActivities,
      metricToday,
      metricPending,
      totalPatients,
      totalDoctors,
    ] = await Promise.all([
      // Today's appointments across the whole clinic (not scoped to owner)
      prisma.appointment.findMany({
        where: { start: { gte: todayStart, lte: todayEnd } },
        orderBy: { start: "asc" },
        take: 50,
        include: {
          patient: { select: { firstname: true, lastname: true } },
          owner: { select: { display_name: true, email: true } },
        },
      }),
      // Upcoming: next 20 across the clinic
      prisma.appointment.findMany({
        where: { start: { gt: todayEnd }, status: { not: "done" } },
        orderBy: { start: "asc" },
        take: 20,
      }),
      // Patient roster
      prisma.patient.findMany({
        orderBy: { created_at: "desc" },
        take: 50,
      }),
      // Doctor directory
      prisma.user.findMany({
        where: { role: "doctor" },
        select: {
          id: true,
          email: true,
          display_name: true,
          image: true,
          specialty: true,
          bio: true,
          phone: true,
          created_at: true,
          doctor_availabilities: {
            select: { weekday: true, start_min: true, end_min: true, timezone: true },
          },
          appointment_types_owned: {
            where: { is_active: true },
            select: { id: true, name: true, duration_minutes: true, is_telehealth: true },
          },
          patients_primary_doctor: { select: { id: true } },
        },
        orderBy: { display_name: "asc" },
      }),
      // Recent activities — last 20 across all appointments
      prisma.activity.findMany({
        orderBy: { created_at: "desc" },
        take: 20,
        select: {
          id: true,
          created_at: true,
          created_by_id: true,
          appointment_id: true,
          type: true,
          content: true,
          created_by: { select: { display_name: true, email: true } },
        },
      }),
      // Metrics
      prisma.appointment.count({ where: { start: { gte: todayStart, lte: todayEnd } } }),
      prisma.appointment.count({ where: { status: "pending" } }),
      prisma.patient.count(),
      prisma.user.count({ where: { role: "doctor" } }),
    ]);

    return NextResponse.json({
      todayAppointments: todayAppts.map((a) => ({
        ...serializeAppointment(a),
        // Include patient name and owner display for secretary's list view
        patient_name: a.patient
          ? `${a.patient.firstname} ${a.patient.lastname}`
          : null,
        owner_display: a.owner?.display_name ?? a.owner?.email ?? null,
      })),
      upcomingAppointments: upcomingAppts.map(serializeAppointment),
      patients: patients.map(serializePatient),
      doctors: doctors.map((d) => ({
        id: d.id,
        email: d.email,
        display_name: d.display_name,
        image: d.image,
        specialty: d.specialty,
        bio: d.bio,
        phone: d.phone,
        created_at: d.created_at.toISOString(),
        availabilities: d.doctor_availabilities,
        appointment_types: d.appointment_types_owned,
        patient_count: d.patients_primary_doctor.length,
      })),
      recentActivities: recentActivities.map((a) => ({
        id: a.id,
        created_at: a.created_at.toISOString(),
        created_by: a.created_by_id,
        appointment: a.appointment_id,
        type: a.type,
        content: a.content,
        created_by_display: a.created_by?.display_name ?? a.created_by?.email ?? null,
      })),
      metrics: {
        today: metricToday,
        pending: metricPending,
        totalPatients,
        totalDoctors,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
