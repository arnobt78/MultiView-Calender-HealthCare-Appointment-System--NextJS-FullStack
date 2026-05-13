/**
 * insights-data.ts — Shared data computation layer for the Insights/Analytics pages.
 *
 * getInsightsData() is called by:
 *   - GET /api/insights (with role-based ownOnly flag)
 *   - prefetchInsights() for SSR cache seeding
 *
 * ownOnly = true  → filters to owner_id = userId (doctor portal, scoped view)
 * ownOnly = false → global aggregate across all appointments (admin/secretary view)
 *
 * Extended payload includes additional metrics added in v006 schema migration:
 *   - avgDurationMinutes, newPatientsThisMonth, busiestDayOfWeek
 *   - revenueThisMonth, revenuePrevMonth (for delta % display)
 *   - statusOverTime (stacked bar: done/pending/alert per month, last 6 months)
 *   - appointmentTypeBreakdown (by type name, count)
 */

import { prisma } from "@/lib/prisma";

export interface InsightsPayload {
  overview: {
    total: number;
    done: number;
    pending: number;
    upcoming: number;
    overdue: number;
    thisMonth: number;
    /** Average appointment duration in minutes across all appointments */
    avgDurationMinutes: number;
    /** Appointments added this month with a valid patient record */
    newPatientsThisMonth: number;
  };
  byStatus: Record<string, number>;
  byCategory: Record<string, number>;
  monthlyData: { month: string; count: number }[];
  topPatients: { name: string; count: number }[];
  /** Revenue this month (paid invoices, cents) */
  revenueThisMonth: number;
  /** Revenue previous month (paid invoices, cents) — used for % delta display */
  revenuePrevMonth: number;
  /** Busiest day of the week: 0 = Sunday … 6 = Saturday, value = appointment count */
  busiestDayOfWeek: { day: number; label: string; count: number }[];
  /** Appointment status breakdown over the last 6 months (stacked bar data) */
  statusOverTime: { month: string; done: number; pending: number; alert: number }[];
  /** Appointment type name → count (pie-style breakdown) */
  appointmentTypeBreakdown: { name: string; count: number }[];
  /** Patient age distribution buckets for the linked patient roster */
  ageDistribution: { label: string; count: number }[];
}

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/**
 * Compute insights data.
 * @param userId   The requesting user's ID (used for own-scope filtering)
 * @param options  ownOnly: restrict queries to owner_id = userId when true
 */
export async function getInsightsData(
  userId: string,
  options: { ownOnly?: boolean } = {}
): Promise<InsightsPayload> {
  const { ownOnly = true } = options;

  const now = new Date();
  const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfPrevMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

  // Where clause: own-scope vs global
  const appointmentWhere = ownOnly ? { owner_id: userId } : {};

  // Fetch all appointments with joins for category, patient, appointment_type
  const appointments = await prisma.appointment.findMany({
    where: appointmentWhere,
    include: {
      category: { select: { label: true } },
      patient: { select: { id: true, firstname: true, lastname: true, birth_date: true } },
      appointment_type: { select: { name: true } },
    },
    orderBy: { start: "desc" },
  });

  // ─── Overview ────────────────────────────────────────────────────────────────
  const total = appointments.length;
  const done = appointments.filter((a) => a.status === "done").length;
  const pending = appointments.filter((a) => a.status === "pending" || !a.status).length;
  const upcoming = appointments.filter((a) => new Date(a.start) > now).length;
  const overdue = appointments.filter(
    (a) => new Date(a.end) < now && a.status !== "done"
  ).length;
  const thisMonth = appointments.filter(
    (a) => new Date(a.start) >= startOfThisMonth
  ).length;

  // Average duration: use stored duration_minutes if set, else derive from start/end diff
  const durationsMinutes = appointments.map((a) => {
    if (a.duration_minutes) return a.duration_minutes;
    const diffMs = new Date(a.end).getTime() - new Date(a.start).getTime();
    return Math.round(diffMs / 60000);
  });
  const avgDurationMinutes =
    durationsMinutes.length > 0
      ? Math.round(durationsMinutes.reduce((s, d) => s + d, 0) / durationsMinutes.length)
      : 0;

  // New patients this month = distinct patients in appointments starting this month
  const newPatientIdsThisMonth = new Set(
    appointments
      .filter((a) => new Date(a.start) >= startOfThisMonth && a.patient_id)
      .map((a) => a.patient_id)
  );
  const newPatientsThisMonth = newPatientIdsThisMonth.size;

  // ─── By status / category ────────────────────────────────────────────────────
  const byStatus: Record<string, number> = {};
  for (const a of appointments) {
    const s = a.status || "pending";
    byStatus[s] = (byStatus[s] ?? 0) + 1;
  }

  const byCategory: Record<string, number> = {};
  for (const a of appointments) {
    const cat = a.category?.label ?? "Uncategorized";
    byCategory[cat] = (byCategory[cat] ?? 0) + 1;
  }

  // ─── Monthly data (last 12 months) ───────────────────────────────────────────
  const monthlyData: { month: string; count: number }[] = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0);
    const count = appointments.filter((a) => {
      const start = new Date(a.start);
      return start >= d && start <= monthEnd;
    }).length;
    monthlyData.push({
      month: d.toLocaleDateString("en", { month: "short", year: "2-digit" }),
      count,
    });
  }

  // ─── Top patients ─────────────────────────────────────────────────────────────
  const patientVisits: Record<string, { name: string; count: number }> = {};
  for (const a of appointments) {
    if (a.patient) {
      const key = a.patient.id;
      if (!patientVisits[key]) {
        patientVisits[key] = {
          name: `${a.patient.firstname} ${a.patient.lastname}`,
          count: 0,
        };
      }
      patientVisits[key].count++;
    }
  }
  const topPatients = Object.values(patientVisits)
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // ─── Revenue this month vs last month ────────────────────────────────────────
  const revenueWhere = ownOnly ? { user_id: userId, status: "paid" } : { status: "paid" };
  const [revenueThisMonthAgg, revenuePrevMonthAgg] = await Promise.all([
    prisma.invoice.aggregate({
      where: {
        ...revenueWhere,
        paid_at: { gte: startOfThisMonth, lte: now },
      },
      _sum: { amount: true },
    }),
    prisma.invoice.aggregate({
      where: {
        ...revenueWhere,
        paid_at: { gte: startOfPrevMonth, lte: endOfPrevMonth },
      },
      _sum: { amount: true },
    }),
  ]);
  const revenueThisMonth = revenueThisMonthAgg._sum.amount ?? 0;
  const revenuePrevMonth = revenuePrevMonthAgg._sum.amount ?? 0;

  // ─── Busiest day of the week ──────────────────────────────────────────────────
  const dayCounts: number[] = [0, 0, 0, 0, 0, 0, 0];
  for (const a of appointments) {
    const dayIndex = new Date(a.start).getDay();
    dayCounts[dayIndex]++;
  }
  const busiestDayOfWeek = dayCounts.map((count, day) => ({
    day,
    label: DAY_LABELS[day],
    count,
  }));

  // ─── Status over time (last 6 months stacked bar) ────────────────────────────
  const statusOverTime: { month: string; done: number; pending: number; alert: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0);
    const inMonth = appointments.filter((a) => {
      const start = new Date(a.start);
      return start >= d && start <= monthEnd;
    });
    statusOverTime.push({
      month: d.toLocaleDateString("en", { month: "short", year: "2-digit" }),
      done: inMonth.filter((a) => a.status === "done").length,
      pending: inMonth.filter((a) => a.status === "pending" || !a.status).length,
      alert: inMonth.filter((a) => a.status === "alert").length,
    });
  }

  // ─── Appointment type breakdown ───────────────────────────────────────────────
  const typeCounts: Record<string, number> = {};
  for (const a of appointments) {
    const name = a.appointment_type?.name ?? "No Type";
    typeCounts[name] = (typeCounts[name] ?? 0) + 1;
  }
  const appointmentTypeBreakdown = Object.entries(typeCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // ─── Patient age distribution ─────────────────────────────────────────────────
  // Buckets: 0-17, 18-35, 36-50, 51-65, 65+
  const ageBuckets = [
    { label: "0–17", min: 0, max: 17, count: 0 },
    { label: "18–35", min: 18, max: 35, count: 0 },
    { label: "36–50", min: 36, max: 50, count: 0 },
    { label: "51–65", min: 51, max: 65, count: 0 },
    { label: "65+", min: 66, max: 999, count: 0 },
  ];
  const seenPatients = new Set<string>();
  for (const a of appointments) {
    if (!a.patient?.birth_date || seenPatients.has(a.patient.id)) continue;
    seenPatients.add(a.patient.id);
    const age =
      Math.floor(
        (now.getTime() - new Date(a.patient.birth_date).getTime()) /
          (1000 * 60 * 60 * 24 * 365.25)
      );
    const bucket = ageBuckets.find((b) => age >= b.min && age <= b.max);
    if (bucket) bucket.count++;
  }
  const ageDistribution = ageBuckets.map(({ label, count }) => ({ label, count }));

  return {
    overview: { total, done, pending, upcoming, overdue, thisMonth, avgDurationMinutes, newPatientsThisMonth },
    byStatus,
    byCategory,
    monthlyData,
    topPatients,
    revenueThisMonth,
    revenuePrevMonth,
    busiestDayOfWeek,
    statusOverTime,
    appointmentTypeBreakdown,
    ageDistribution,
  };
}
