/**
 * Prisma-backed insights aggregates — scoped by owner and date range (no full-table findMany for counts).
 */

import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import type { InsightsDataOptions } from "@/lib/insights/insights-scope";
import type { InsightsPeriod } from "@/lib/insights/insights-period";
import { resolveDateRange, resolvePreviousDateRange } from "@/lib/insights/insights-period";
import type { InsightsTrendPoint } from "@/lib/insights/insights-types";

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function appointmentOwnerWhere(opts: InsightsDataOptions): Prisma.AppointmentWhereInput {
  return opts.organizationWide ? {} : { owner_id: opts.filterOwnerId };
}

export function invoiceOwnerWhere(opts: InsightsDataOptions): Prisma.InvoiceWhereInput {
  return opts.organizationWide ? {} : { user_id: opts.filterOwnerId };
}

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function startOfWeek(d: Date): Date {
  const day = d.getDay();
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() - day);
}

export async function countAppointments(
  where: Prisma.AppointmentWhereInput,
  extra?: Prisma.AppointmentWhereInput
): Promise<number> {
  return prisma.appointment.count({ where: { ...where, ...extra } });
}

export async function countAppointmentsByStatus(
  base: Prisma.AppointmentWhereInput
): Promise<Record<string, number>> {
  const rows = await prisma.appointment.groupBy({
    by: ["status"],
    where: base,
    _count: { _all: true },
  });
  const out: Record<string, number> = {};
  for (const row of rows) {
    const key = row.status || "pending";
    out[key] = row._count._all;
  }
  return out;
}

export async function fetchAppointmentTotals(
  base: Prisma.AppointmentWhereInput,
  now: Date
): Promise<{
  all: number;
  today: number;
  thisWeek: number;
  thisMonth: number;
  yearToDate: number;
  upcoming: number;
  overdue: number;
  telehealthCount: number;
}> {
  const todayStart = startOfDay(now);
  const weekStart = startOfWeek(now);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const yearStart = new Date(now.getFullYear(), 0, 1);

  const [all, today, thisWeek, thisMonth, yearToDate, upcoming, overdue, telehealthCount] =
    await Promise.all([
      countAppointments(base),
      countAppointments(base, { start: { gte: todayStart, lte: now } }),
      countAppointments(base, { start: { gte: weekStart, lte: now } }),
      countAppointments(base, { start: { gte: monthStart, lte: now } }),
      countAppointments(base, { start: { gte: yearStart, lte: now } }),
      countAppointments(base, { start: { gt: now } }),
      countAppointments(base, {
        end: { lt: now },
        OR: [{ status: { not: "done" } }, { status: null }],
      }),
      countAppointments(base, { is_telehealth: true }),
    ]);

  return { all, today, thisWeek, thisMonth, yearToDate, upcoming, overdue, telehealthCount };
}

export async function fetchAvgDurationMinutes(
  base: Prisma.AppointmentWhereInput
): Promise<number> {
  const rows = await prisma.appointment.findMany({
    where: base,
    select: { duration_minutes: true, start: true, end: true },
    take: 5000,
  });
  if (rows.length === 0) return 0;
  const sum = rows.reduce((acc, a) => {
    if (a.duration_minutes) return acc + a.duration_minutes;
    const diffMs = new Date(a.end).getTime() - new Date(a.start).getTime();
    return acc + Math.round(diffMs / 60000);
  }, 0);
  return Math.round(sum / rows.length);
}

// Chart series below use parallel count/groupBy — bounded findMany only for avg duration + age buckets.

export async function fetchRevenueAggregates(
  invoiceBase: Prisma.InvoiceWhereInput,
  period: InsightsPeriod,
  now: Date
): Promise<{
  paidInPeriod: number;
  paidPrevPeriod: number;
  invoiceByStatus: Record<string, number>;
}> {
  const range = resolveDateRange(period, now);
  const prev = resolvePreviousDateRange(period, now);

  const statusRows = await prisma.invoice.groupBy({
    by: ["status"],
    where: invoiceBase,
    _count: { _all: true },
  });
  const invoiceByStatus: Record<string, number> = {};
  for (const row of statusRows) {
    invoiceByStatus[row.status] = row._count._all;
  }

  const [paidInPeriodAgg, paidPrevAgg] = await Promise.all([
    prisma.invoice.aggregate({
      where: {
        ...invoiceBase,
        status: "paid",
        paid_at: { gte: range.start, lte: range.end },
      },
      _sum: { amount: true },
    }),
    prisma.invoice.aggregate({
      where: {
        ...invoiceBase,
        status: "paid",
        paid_at: { gte: prev.start, lte: prev.end },
      },
      _sum: { amount: true },
    }),
  ]);

  return {
    paidInPeriod: paidInPeriodAgg._sum.amount ?? 0,
    paidPrevPeriod: paidPrevAgg._sum.amount ?? 0,
    invoiceByStatus,
  };
}

export async function fetchPaymentSuccessPct(
  invoiceBase: Prisma.InvoiceWhereInput
): Promise<number> {
  const invoices = await prisma.invoice.findMany({
    where: invoiceBase,
    select: { id: true, payments: { select: { status: true } } },
    take: 2000,
  });
  if (invoices.length === 0) return 0;
  let withPayment = 0;
  let succeeded = 0;
  for (const inv of invoices) {
    if (inv.payments.length === 0) continue;
    withPayment++;
    if (inv.payments.some((p) => p.status === "succeeded")) succeeded++;
  }
  if (withPayment === 0) return 0;
  return Math.round((succeeded / withPayment) * 100);
}

function monthRange(now: Date, monthsAgo: number): { start: Date; end: Date } {
  const start = new Date(now.getFullYear(), now.getMonth() - monthsAgo, 1);
  const end = new Date(now.getFullYear(), now.getMonth() - monthsAgo + 1, 0, 23, 59, 59);
  return { start, end };
}

/** Last 12 calendar months — parallel count queries (no row hydration). */
export async function fetchMonthlyCountsLast12Months(
  base: Prisma.AppointmentWhereInput,
  now: Date
): Promise<{ month: string; count: number }[]> {
  const tasks = Array.from({ length: 12 }, (_, idx) => {
    const monthsAgo = 11 - idx;
    const { start, end } = monthRange(now, monthsAgo);
    return countAppointments(base, { start: { gte: start, lte: end } }).then((count) => ({
      month: start.toLocaleDateString("en", { month: "short", year: "2-digit" }),
      count,
    }));
  });
  return Promise.all(tasks);
}

/** Last 6 months — done / pending / alert via scoped counts. */
export async function fetchStatusOverTimeLast6Months(
  base: Prisma.AppointmentWhereInput,
  now: Date
): Promise<{ month: string; done: number; pending: number; alert: number }[]> {
  const tasks = Array.from({ length: 6 }, (_, idx) => {
    const monthsAgo = 5 - idx;
    const { start, end } = monthRange(now, monthsAgo);
    const rangeWhere = { ...base, start: { gte: start, lte: end } };
    return Promise.all([
      countAppointments(rangeWhere, { status: "done" }),
      countAppointments(rangeWhere, {
        OR: [{ status: "pending" }, { status: null }],
      }),
      countAppointments(rangeWhere, { status: "alert" }),
    ]).then(([done, pending, alert]) => ({
      month: start.toLocaleDateString("en", { month: "short", year: "2-digit" }),
      done,
      pending,
      alert,
    }));
  });
  return Promise.all(tasks);
}

/** Weekday distribution — lightweight start timestamps only. */
export async function fetchBusiestDayOfWeekCounts(
  base: Prisma.AppointmentWhereInput
): Promise<{ day: number; label: string; count: number }[]> {
  const rows = await prisma.appointment.findMany({
    where: base,
    select: { start: true },
    take: 15000,
  });
  const dayCounts = [0, 0, 0, 0, 0, 0, 0];
  for (const row of rows) {
    dayCounts[new Date(row.start).getDay()]++;
  }
  return dayCounts.map((count, day) => ({ day, label: DAY_LABELS[day], count }));
}

export async function fetchCategoryBreakdown(
  base: Prisma.AppointmentWhereInput,
  rangeStart: Date,
  rangeEnd: Date
): Promise<Record<string, number>> {
  const rows = await prisma.appointment.groupBy({
    by: ["category_id"],
    where: { ...base, start: { gte: rangeStart, lte: rangeEnd } },
    _count: { _all: true },
  });
  const categoryIds = rows
    .map((r) => r.category_id)
    .filter((id): id is string => id != null);
  const categories =
    categoryIds.length > 0
      ? await prisma.category.findMany({
          where: { id: { in: categoryIds } },
          select: { id: true, label: true },
        })
      : [];
  const labelById = new Map(categories.map((c) => [c.id, c.label]));
  const out: Record<string, number> = {};
  for (const row of rows) {
    const label = row.category_id
      ? labelById.get(row.category_id) ?? "Uncategorized"
      : "Uncategorized";
    out[label] = (out[label] ?? 0) + row._count._all;
  }
  return out;
}

export async function fetchTypeBreakdown(
  base: Prisma.AppointmentWhereInput,
  rangeStart: Date,
  rangeEnd: Date
): Promise<{ name: string; count: number }[]> {
  const rows = await prisma.appointment.groupBy({
    by: ["appointment_type_id"],
    where: { ...base, start: { gte: rangeStart, lte: rangeEnd } },
    _count: { _all: true },
  });
  const typeIds = rows
    .map((r) => r.appointment_type_id)
    .filter((id): id is string => id != null);
  const types =
    typeIds.length > 0
      ? await prisma.appointmentType.findMany({
          where: { id: { in: typeIds } },
          select: { id: true, name: true },
        })
      : [];
  const nameById = new Map(types.map((t) => [t.id, t.name]));
  return rows
    .map((row) => ({
      name: row.appointment_type_id
        ? nameById.get(row.appointment_type_id) ?? "No Type"
        : "No Type",
      count: row._count._all,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
}

export async function fetchTopPatients(
  base: Prisma.AppointmentWhereInput,
  rangeStart: Date,
  rangeEnd: Date,
  limit = 10
): Promise<{ name: string; count: number }[]> {
  const rows = await prisma.appointment.groupBy({
    by: ["patient_id"],
    where: {
      ...base,
      start: { gte: rangeStart, lte: rangeEnd },
      patient_id: { not: null },
    },
    _count: { _all: true },
  });
  const topRows = rows
    .sort((a, b) => b._count._all - a._count._all)
    .slice(0, limit);
  const patientIds = topRows
    .map((r) => r.patient_id)
    .filter((id): id is string => id != null);
  const patients =
    patientIds.length > 0
      ? await prisma.patient.findMany({
          where: { id: { in: patientIds } },
          select: { id: true, firstname: true, lastname: true },
        })
      : [];
  const nameById = new Map(
    patients.map((p) => [p.id, `${p.firstname} ${p.lastname}`.trim()])
  );
  return topRows.map((row) => ({
    name: row.patient_id ? nameById.get(row.patient_id) ?? "Unknown" : "Unknown",
    count: row._count._all,
  }));
}

/** Trend buckets for selected period — count queries, no full appointment rows. */
export async function fetchTrendCountsByPeriod(
  base: Prisma.AppointmentWhereInput,
  period: InsightsPeriod,
  now: Date
): Promise<InsightsTrendPoint[]> {
  const range = resolveDateRange(period, now);
  if (period === "day") {
    const dayStart = startOfDay(now);
    return Promise.all(
      Array.from({ length: 24 }, (_, h) => {
        const hourStart = new Date(dayStart);
        hourStart.setHours(h, 0, 0, 0);
        const hourEnd = new Date(dayStart);
        hourEnd.setHours(h, 59, 59, 999);
        return countAppointments(base, {
          start: { gte: hourStart, lte: hourEnd > now ? now : hourEnd },
        }).then((count) => ({ label: `${h}:00`, count }));
      })
    );
  }
  if (period === "week") {
    const weekStart = startOfWeek(now);
    return Promise.all(
      Array.from({ length: 7 }, (_, d) => {
        const dayStart = new Date(weekStart);
        dayStart.setDate(weekStart.getDate() + d);
        const dayEnd = new Date(dayStart);
        dayEnd.setHours(23, 59, 59, 999);
        return countAppointments(base, {
          start: { gte: dayStart, lte: dayEnd > now ? now : dayEnd },
        }).then((count) => ({ label: DAY_LABELS[d], count }));
      })
    );
  }
  const monthly = await fetchMonthlyCountsLast12Months(base, now);
  return monthly.map((m) => ({ label: m.month, count: m.count }));
}

export async function fetchAgeDistribution(
  base: Prisma.AppointmentWhereInput,
  rangeStart: Date,
  rangeEnd: Date,
  now: Date
): Promise<{ label: string; count: number }[]> {
  const patientRows = await prisma.appointment.findMany({
    where: {
      ...base,
      start: { gte: rangeStart, lte: rangeEnd },
      patient_id: { not: null },
    },
    select: { patient: { select: { id: true, birth_date: true } } },
    distinct: ["patient_id"],
    take: 5000,
  });
  const ageBuckets = [
    { label: "0–17", min: 0, max: 17, count: 0 },
    { label: "18–35", min: 18, max: 35, count: 0 },
    { label: "36–50", min: 36, max: 50, count: 0 },
    { label: "51–65", min: 51, max: 65, count: 0 },
    { label: "65+", min: 66, max: 999, count: 0 },
  ];
  for (const row of patientRows) {
    const birth = row.patient?.birth_date;
    if (!birth) continue;
    const age = Math.floor(
      (now.getTime() - new Date(birth).getTime()) / (1000 * 60 * 60 * 24 * 365.25)
    );
    const bucket = ageBuckets.find((b) => age >= b.min && age <= b.max);
    if (bucket) bucket.count++;
  }
  return ageBuckets.map(({ label, count }) => ({ label, count }));
}

export async function countDistinctPatientsInRange(
  base: Prisma.AppointmentWhereInput,
  rangeStart: Date,
  rangeEnd: Date
): Promise<number> {
  const rows = await prisma.appointment.groupBy({
    by: ["patient_id"],
    where: {
      ...base,
      start: { gte: rangeStart, lte: rangeEnd },
      patient_id: { not: null },
    },
  });
  return rows.length;
}

export async function countNewPatientsInMonth(
  base: Prisma.AppointmentWhereInput,
  monthStart: Date,
  now: Date
): Promise<number> {
  const rows = await prisma.appointment.groupBy({
    by: ["patient_id"],
    where: {
      ...base,
      start: { gte: monthStart, lte: now },
      patient_id: { not: null },
    },
  });
  return rows.length;
}

export async function fetchDoctorBreakdown(
  organizationWide: boolean
): Promise<
  | {
      doctorId: string;
      name: string;
      specialty: string | null;
      appointmentCount: number;
      revenueCents: number;
    }[]
  | null
> {
  if (!organizationWide) return null;

  const doctors = await prisma.user.findMany({
    where: { role: "doctor" },
    select: { id: true, display_name: true, email: true, specialty: true },
  });

  const rows = await Promise.all(
    doctors.map(async (doc) => {
      const [appointmentCount, revenueAgg] = await Promise.all([
        prisma.appointment.count({ where: { owner_id: doc.id } }),
        prisma.invoice.aggregate({
          where: { user_id: doc.id, status: "paid" },
          _sum: { amount: true },
        }),
      ]);
      const name =
        doc.display_name?.trim() || doc.email?.trim() || "Doctor";
      return {
        doctorId: doc.id,
        name,
        specialty: doc.specialty,
        appointmentCount,
        revenueCents: revenueAgg._sum.amount ?? 0,
      };
    })
  );

  return rows.sort((a, b) => b.appointmentCount - a.appointmentCount);
}
