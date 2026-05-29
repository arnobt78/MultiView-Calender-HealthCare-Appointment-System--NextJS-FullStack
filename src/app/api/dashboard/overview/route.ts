export const dynamic = "force-dynamic";

/**
 * GET /api/dashboard/overview
 * Server-side summary stats for the dashboard overview card section.
 * Returns: appointments today, this week, total patients, total doctors,
 *          pending/done/alert counts, next appointment, revenue summary.
 *
 * Redis caching strategy:
 * - Cache key: `dashboard:overview:<userId>` — per-user so no data leaks between accounts.
 * - TTL: 90 seconds. Aggregating 16 Prisma queries against a remote VPS Postgres takes
 *   600 ms–2.4 s per call; caching collapses that to <5 ms on cache hits.
 * - Invalidation: any CRUD mutation that affects the overview numbers must call
 *   `redis.del(`dashboard:overview:${userId}`)` on the server, or simply let the
 *   90 s TTL expire — the staleTime on the client (3 min) ensures users never see
 *   the cached result more than once per session anyway.
 * - Graceful degradation: if Redis is not configured (UPSTASH_REDIS_REST_URL /
 *   UPSTASH_REDIS_REST_TOKEN missing), `redis.isConfigured` is false and the route
 *   falls through to the normal Prisma queries without any error.
 */

import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { redis } from "@/lib/redis";
import {
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
} from "date-fns";
import {
  coerceDashboardOverviewUpcomingAppointments,
  DASHBOARD_UPCOMING_APPOINTMENTS_LIMIT,
  dashboardOverviewAppointmentQueueSelect,
  mapDashboardOverviewQueueAppointment,
} from "@/lib/dashboard-overview-queue";

/** Cache TTL in seconds — 90 s balances freshness vs DB load on VPS Postgres. */
const OVERVIEW_CACHE_TTL = 90;

export async function GET() {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    /*
     * Redis cache check — serves the cached JSON string directly if it exists,
     * skipping all 16+ Prisma queries and cutting response time from ~1–2 s to <5 ms.
     */
    const cacheKey = `dashboard:overview:${sessionUser.userId}`;
    if (redis.isConfigured) {
      const cached = await redis.get(cacheKey);
      if (cached) {
        const parsed = coerceDashboardOverviewUpcomingAppointments(
          JSON.parse(cached as string) as Record<string, unknown>
        );
        return NextResponse.json(parsed, { headers: { "X-Cache": "HIT" } });
      }
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
      upcomingAppointmentsRaw,
      recentAppointments,
      overdueCount,
      totalInvoices,
      paidInvoices,
    ] = await Promise.all([
      prisma.appointment.count({ where: { owner_id: sessionUser.userId } }),
      prisma.appointment.count({
        where: { owner_id: sessionUser.userId, start: { gte: todayStart, lte: todayEnd } },
      }),
      prisma.appointment.count({
        where: { owner_id: sessionUser.userId, start: { gte: weekStart, lte: weekEnd } },
      }),
      prisma.appointment.count({
        where: { owner_id: sessionUser.userId, start: { gte: monthStart, lte: monthEnd } },
      }),
      prisma.appointment.count({
        where: { owner_id: sessionUser.userId, status: "done" },
      }),
      prisma.appointment.count({
        where: { owner_id: sessionUser.userId, status: "pending" },
      }),
      prisma.appointment.count({
        where: { owner_id: sessionUser.userId, status: "alert" },
      }),
      prisma.patient.count(),
      prisma.patient.count({ where: { active: true } }),
      prisma.user.count({ where: { role: "doctor" } }),
      prisma.category.count(),
      prisma.appointment.findMany({
        where: {
          owner_id: sessionUser.userId,
          start: { gt: now },
          status: { not: "done" },
        },
        orderBy: { start: "asc" },
        take: DASHBOARD_UPCOMING_APPOINTMENTS_LIMIT,
        select: dashboardOverviewAppointmentQueueSelect,
      }),
      prisma.appointment.findMany({
        where: { owner_id: sessionUser.userId },
        orderBy: { created_at: "desc" },
        take: 5,
        select: dashboardOverviewAppointmentQueueSelect,
      }),
      prisma.appointment.count({
        where: {
          owner_id: sessionUser.userId,
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

    const payload = {
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
      upcomingAppointments: upcomingAppointmentsRaw.map((a) =>
        mapDashboardOverviewQueueAppointment(a)
      ),
      recentAppointments: recentAppointments.map((a) =>
        mapDashboardOverviewQueueAppointment(a)
      ),
      revenue: {
        paidCents: paidRevenue._sum.amount ?? 0,
        outstandingCents: outstandingRevenue._sum.amount ?? 0,
        totalInvoices,
        paidInvoices,
      },
    };

    /*
     * Write the fresh result to Redis with a 90 s TTL so subsequent requests
     * within that window skip all Prisma queries entirely.
     * Fire-and-forget (`void`) — don't block the HTTP response on the Redis write.
     */
    if (redis.isConfigured) {
      void redis.set(cacheKey, JSON.stringify(payload), OVERVIEW_CACHE_TTL);
    }

    return NextResponse.json(payload);
  } catch (error: unknown) {
    console.error("Dashboard overview error:", error);
    return NextResponse.json({ error: "Failed to load overview" }, { status: 500 });
  }
}
