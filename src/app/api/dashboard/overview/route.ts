/**
 * GET /api/dashboard/overview
 * Server-side summary stats for the dashboard overview card section.
 * Returns: appointments today, this week, total patients, total doctors,
 *          pending/done/alert counts, next appointment, revenue summary.
 */

import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import {
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
} from "date-fns";

export async function GET() {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const now = new Date();
    const todayStart = startOfDay(now);
    const todayEnd = endOfDay(now);
    const weekStart = startOfWeek(now, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);

    const [
      totalAppointments,
      todayAppointments,
      weekAppointments,
      monthAppointments,
      doneCount,
      pendingCount,
      alertCount,
      totalPatients,
      activePatients,
      totalDoctors,
      totalCategories,
      nextAppointmentRaw,
      recentAppointments,
      overdueCount,
      totalInvoices,
      paidInvoices,
    ] = await Promise.all([
      prisma.appointment.count({ where: { user_id: sessionUser.userId } }),
      prisma.appointment.count({
        where: { user_id: sessionUser.userId, start: { gte: todayStart, lte: todayEnd } },
      }),
      prisma.appointment.count({
        where: { user_id: sessionUser.userId, start: { gte: weekStart, lte: weekEnd } },
      }),
      prisma.appointment.count({
        where: { user_id: sessionUser.userId, start: { gte: monthStart, lte: monthEnd } },
      }),
      prisma.appointment.count({
        where: { user_id: sessionUser.userId, status: "done" },
      }),
      prisma.appointment.count({
        where: { user_id: sessionUser.userId, status: "pending" },
      }),
      prisma.appointment.count({
        where: { user_id: sessionUser.userId, status: "alert" },
      }),
      prisma.patient.count(),
      prisma.patient.count({ where: { active: true } }),
      prisma.user.count({ where: { role: "doctor" } }),
      prisma.category.count(),
      prisma.appointment.findFirst({
        where: {
          user_id: sessionUser.userId,
          start: { gt: now },
          status: { not: "done" },
        },
        orderBy: { start: "asc" },
        select: { id: true, title: true, start: true, end: true, location: true },
      }),
      prisma.appointment.findMany({
        where: { user_id: sessionUser.userId },
        orderBy: { created_at: "desc" },
        take: 5,
        select: {
          id: true,
          title: true,
          start: true,
          end: true,
          status: true,
          patient: { select: { firstname: true, lastname: true } },
        },
      }),
      prisma.appointment.count({
        where: {
          user_id: sessionUser.userId,
          end: { lt: now },
          status: { not: "done" },
        },
      }),
      prisma.invoice.count({ where: { user_id: sessionUser.userId } }),
      prisma.invoice.count({
        where: { user_id: sessionUser.userId, status: "paid" },
      }),
    ]);

    // Revenue: sum of paid invoice amounts (stored in cents)
    const paidRevenue = await prisma.invoice.aggregate({
      where: { user_id: sessionUser.userId, status: "paid" },
      _sum: { amount: true },
    });
    const outstandingRevenue = await prisma.invoice.aggregate({
      where: { user_id: sessionUser.userId, status: { in: ["draft", "sent"] } },
      _sum: { amount: true },
    });

    return NextResponse.json({
      appointments: {
        total: totalAppointments,
        today: todayAppointments,
        thisWeek: weekAppointments,
        thisMonth: monthAppointments,
        done: doneCount,
        pending: pendingCount,
        alert: alertCount,
        overdue: overdueCount,
      },
      patients: {
        total: totalPatients,
        active: activePatients,
      },
      doctors: totalDoctors,
      categories: totalCategories,
      nextAppointment: nextAppointmentRaw
        ? {
            id: nextAppointmentRaw.id,
            title: nextAppointmentRaw.title,
            start: nextAppointmentRaw.start.toISOString(),
            end: nextAppointmentRaw.end.toISOString(),
            location: nextAppointmentRaw.location,
          }
        : null,
      recentAppointments: recentAppointments.map((a) => ({
        id: a.id,
        title: a.title,
        start: a.start.toISOString(),
        end: a.end.toISOString(),
        status: a.status,
        patientName: a.patient
          ? `${a.patient.firstname} ${a.patient.lastname}`
          : null,
      })),
      revenue: {
        paidCents: paidRevenue._sum.amount ?? 0,
        outstandingCents: outstandingRevenue._sum.amount ?? 0,
        totalInvoices,
        paidInvoices,
      },
    });
  } catch (error) {
    console.error("Dashboard overview error:", error);
    return NextResponse.json({ error: "Failed to load overview" }, { status: 500 });
  }
}
