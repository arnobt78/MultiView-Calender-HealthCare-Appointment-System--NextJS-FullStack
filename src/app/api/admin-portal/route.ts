/**
 * GET /api/admin-portal
 *
 * Single prefetch endpoint for the Admin Portal SSR page.
 * Returns a global overview of the clinic including:
 *   - KPI overview (appointments, patients, doctors, revenue, pending, overdue)
 *   - doctor directory (full list with extended fields)
 *   - last 15 appointments across all users
 *
 * RBAC: admin role only — other roles receive 403.
 * Cache key: queryKeys.adminPortal.all
 */

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { getUserRole, isAdminRole } from "@/lib/rbac";
import { serializeAppointment } from "@/lib/serializers";
import { startOfDay, endOfDay } from "date-fns";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const role = await getUserRole(sessionUser.userId);
    if (!isAdminRole(role)) {
      return NextResponse.json({ error: "Forbidden — admin role required" }, { status: 403 });
    }

    const now = new Date();
    const todayStart = startOfDay(now);
    const todayEnd = endOfDay(now);

    const [
      totalAppointments,
      todayAppointments,
      pendingAppointments,
      overdueAppointments,
      totalPatients,
      totalDoctors,
      doctors,
      recentAppointments,
      paidRevenueAgg,
      outstandingRevenueAgg,
    ] = await Promise.all([
      prisma.appointment.count(),
      prisma.appointment.count({ where: { start: { gte: todayStart, lte: todayEnd } } }),
      prisma.appointment.count({ where: { status: "pending" } }),
      prisma.appointment.count({ where: { end: { lt: now }, status: { not: "done" } } }),
      prisma.patient.count(),
      prisma.user.count({ where: { role: "doctor" } }),
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
          license_number: true,
          consultation_fee: true,
          languages_spoken: true,
          years_of_experience: true,
          office_location: true,
          department: true,
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
      prisma.appointment.findMany({
        orderBy: { created_at: "desc" },
        take: 15,
        include: {
          patient: { select: { firstname: true, lastname: true } },
          owner: { select: { display_name: true, email: true } },
        },
      }),
      prisma.invoice.aggregate({ where: { status: "paid" }, _sum: { amount: true } }),
      prisma.invoice.aggregate({
        where: { status: { in: ["draft", "sent"] } },
        _sum: { amount: true },
      }),
    ]);

    return NextResponse.json({
      overview: {
        totalAppointments,
        todayAppointments,
        totalPatients,
        totalDoctors,
        pendingAppointments,
        overdueAppointments,
        paidRevenueCents: paidRevenueAgg._sum.amount ?? 0,
        outstandingRevenueCents: outstandingRevenueAgg._sum.amount ?? 0,
      },
      doctors: doctors.map((d) => ({
        id: d.id,
        email: d.email,
        display_name: d.display_name,
        image: d.image,
        specialty: d.specialty,
        bio: d.bio,
        phone: d.phone,
        license_number: d.license_number,
        consultation_fee: d.consultation_fee,
        languages_spoken: d.languages_spoken,
        years_of_experience: d.years_of_experience,
        office_location: d.office_location,
        department: d.department,
        created_at: d.created_at.toISOString(),
        availabilities: d.doctor_availabilities,
        appointment_types: d.appointment_types_owned,
        patient_count: d.patients_primary_doctor.length,
      })),
      recentAppointments: recentAppointments.map((a) => ({
        ...serializeAppointment(a),
        patient_name: a.patient
          ? `${a.patient.firstname} ${a.patient.lastname}`
          : null,
        owner_display: a.owner?.display_name ?? a.owner?.email ?? null,
      })),
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
