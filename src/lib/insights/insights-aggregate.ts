/**
 * Prisma-backed insights aggregates — scoped by owner and date range (no full-table findMany for counts).
 */

import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { buildDoctorScopedInvoiceWhere } from "@/lib/invoices-revenue-scope";
import type { InsightsDataOptions } from "@/lib/insights/insights-scope";
import type { InsightsPeriod } from "@/lib/insights/insights-period";
import {
  isInsightsPeriodAll,
  resolveDateRange,
  resolveDateRangeInclusive,
  resolvePreviousDateRange,
} from "@/lib/insights/insights-period";
import {
  resolveInsightsAppointmentStartFilter,
  resolveInsightsPaidAtFilter,
  withAppointmentStartInPeriod,
} from "@/lib/insights/insights-period-filter";
import type { InsightsTrendPoint } from "@/lib/insights/insights-types";

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/**
 * Appointment scope for /insights — personal matches doctor portal (owner OR treating).
 * Org-wide = all visits (admin / doctor org toggle).
 */
export function appointmentOwnerWhere(opts: InsightsDataOptions): Prisma.AppointmentWhereInput {
  if (opts.organizationWide) return {};
  const id = opts.filterOwnerId;
  return {
    OR: [{ owner_id: id }, { treating_physician_id: id }],
  };
}

/** @deprecated Use buildInsightsScopeBases — personal invoice scope is async (visit-linked OR). */
export function invoiceOwnerWhere(opts: InsightsDataOptions): Prisma.InvoiceWhereInput {
  if (opts.organizationWide) return {};
  return { user_id: opts.filterOwnerId };
}

/** Prisma + raw-SQL bases for getInsightsData — invoice side aligned with fetchInvoicesForViewer. */
export async function buildInsightsScopeBases(
  opts: InsightsDataOptions
): Promise<{
  apptBase: Prisma.AppointmentWhereInput;
  invoiceBase: Prisma.InvoiceWhereInput;
}> {
  const apptBase = appointmentOwnerWhere(opts);
  const invoiceBase = opts.organizationWide
    ? {}
    : await buildDoctorScopedInvoiceWhere(opts.filterOwnerId);
  return { apptBase, invoiceBase };
}

/** Personal scope doctor id for raw SQL (DB `appointments.user_id` = Prisma `owner_id`). */
export function resolveAppointmentOwnerUserId(
  base: Prisma.AppointmentWhereInput
): string | null {
  if (typeof base.owner_id === "string") return base.owner_id;
  if (Array.isArray(base.OR)) {
    for (const clause of base.OR) {
      if (!clause || typeof clause !== "object") continue;
      if (typeof clause.owner_id === "string") return clause.owner_id;
      if (typeof clause.treating_physician_id === "string") {
        return clause.treating_physician_id;
      }
    }
  }
  return null;
}

function isInsightsScopeUnrestricted(
  where: Prisma.AppointmentWhereInput | Prisma.InvoiceWhereInput
): boolean {
  return Object.keys(where).length === 0;
}

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function startOfWeek(d: Date): Date {
  const day = d.getDay();
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() - day);
}

function endOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);
}

function endOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);
}

function endOfYear(d: Date): Date {
  return new Date(d.getFullYear(), 11, 31, 23, 59, 59, 999);
}

function endOfWeek(d: Date): Date {
  const start = startOfWeek(d);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  return endOfDay(end);
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

/** Status chips — all-time uses full scope; other periods filter by `start`. */
export async function countAppointmentsByStatusForPeriod(
  base: Prisma.AppointmentWhereInput,
  period: InsightsPeriod,
  now: Date
): Promise<Record<string, number>> {
  if (isInsightsPeriodAll(period)) {
    return countAppointmentsByStatus(base);
  }
  const range = resolveDateRangeInclusive(period, now);
  return countAppointmentsByStatusInRange(base, range.start, range.end);
}

/** Status chips on /insights — scoped to chart period (`start` within range). */
export async function countAppointmentsByStatusInRange(
  base: Prisma.AppointmentWhereInput,
  rangeStart: Date,
  rangeEnd: Date
): Promise<Record<string, number>> {
  const rows = await prisma.appointment.groupBy({
    by: ["status"],
    where: { ...base, start: { gte: rangeStart, lte: rangeEnd } },
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
  /** All appointments in scope (includes past + future scheduled). */
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
  const todayEnd = endOfDay(now);
  const weekEnd = endOfWeek(now);
  const monthEnd = endOfMonth(now);
  const yearEnd = endOfYear(now);

  const [all, today, thisWeek, thisMonth, yearToDate, upcoming, overdue, telehealthCount] =
    await Promise.all([
      countAppointments(base),
      countAppointments(base, { start: { gte: todayStart, lte: todayEnd } }),
      countAppointments(base, { start: { gte: weekStart, lte: weekEnd } }),
      countAppointments(base, { start: { gte: monthStart, lte: monthEnd } }),
      countAppointments(base, { start: { gte: yearStart, lte: yearEnd } }),
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

/** Average visit length for the active View-as period. */
export async function fetchAvgDurationMinutesForPeriod(
  base: Prisma.AppointmentWhereInput,
  period: InsightsPeriod,
  now: Date
): Promise<number> {
  const rows = await prisma.appointment.findMany({
    where: withAppointmentStartInPeriod(base, period, now),
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

/** Average visit length for appointments with `start` in the chart period. */
export async function fetchAvgDurationMinutesInRange(
  base: Prisma.AppointmentWhereInput,
  rangeStart: Date,
  rangeEnd: Date
): Promise<number> {
  const rows = await prisma.appointment.findMany({
    where: { ...base, start: { gte: rangeStart, lte: rangeEnd } },
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
  const paidFilter = resolveInsightsPaidAtFilter(period, now);

  const statusWhere: Prisma.InvoiceWhereInput = { ...invoiceBase };
  if (!isInsightsPeriodAll(period)) {
    const periodRange = resolveDateRangeInclusive(period, now);
    statusWhere.created_at = { gte: periodRange.start, lte: periodRange.end };
  }

  const statusRows = await prisma.invoice.groupBy({
    by: ["status"],
    where: statusWhere,
    _count: { _all: true },
  });
  const invoiceByStatus: Record<string, number> = {};
  for (const row of statusRows) {
    invoiceByStatus[row.status] = row._count._all;
  }

  const paidWhere: Prisma.InvoiceWhereInput = {
    ...invoiceBase,
    status: "paid",
  };
  if (paidFilter) {
    paidWhere.paid_at = { gte: paidFilter.gte, lte: paidFilter.lte };
  }

  const paidInPeriodAgg = await prisma.invoice.aggregate({
    where: paidWhere,
    _sum: { amount: true },
  });

  if (isInsightsPeriodAll(period)) {
    return {
      paidInPeriod: paidInPeriodAgg._sum.amount ?? 0,
      paidPrevPeriod: 0,
      invoiceByStatus,
    };
  }

  const prev = resolvePreviousDateRange(period, now);
  const paidPrevAgg = await prisma.invoice.aggregate({
    where: {
      ...invoiceBase,
      status: "paid",
      paid_at: { gte: prev.start, lte: prev.end },
    },
    _sum: { amount: true },
  });

  return {
    paidInPeriod: paidInPeriodAgg._sum.amount ?? 0,
    paidPrevPeriod: paidPrevAgg._sum.amount ?? 0,
    invoiceByStatus,
  };
}

async function sumPaidInvoiceAmount(
  base: Prisma.InvoiceWhereInput,
  paidStart: Date,
  paidEnd: Date
): Promise<number> {
  const agg = await prisma.invoice.aggregate({
    where: {
      ...base,
      status: "paid",
      paid_at: { gte: paidStart, lte: paidEnd },
    },
    _sum: { amount: true },
  });
  return agg._sum.amount ?? 0;
}

/** Paid revenue for period=all — no paid_at range (avoids invalid JS max-date in Prisma). */
async function sumPaidInvoiceAmountAllTime(
  base: Prisma.InvoiceWhereInput
): Promise<number> {
  const agg = await prisma.invoice.aggregate({
    where: {
      ...base,
      status: "paid",
      paid_at: { not: null },
    },
    _sum: { amount: true },
  });
  return agg._sum.amount ?? 0;
}

/**
 * Revenue trend buckets for Insights revenue area chart.
 * Note: `count` carries paid amount (cents) for chart API compatibility.
 */
export async function fetchRevenueTrendByPeriod(
  invoiceBase: Prisma.InvoiceWhereInput,
  period: InsightsPeriod,
  now: Date
): Promise<InsightsTrendPoint[]> {
  if (period === "day") {
    const dayStart = startOfDay(now);
    return Promise.all(
      Array.from({ length: 24 }, (_, h) => {
        const hourStart = new Date(dayStart);
        hourStart.setHours(h, 0, 0, 0);
        const hourEnd = new Date(dayStart);
        hourEnd.setHours(h, 59, 59, 999);
        return sumPaidInvoiceAmount(invoiceBase, hourStart, hourEnd).then((count) => ({
          label: `${h}:00`,
          count,
        }));
      })
    );
  }

  if (period === "week") {
    const weekStart = startOfWeek(now);
    return Promise.all(
      Array.from({ length: 7 }, (_, d) => {
        const day = new Date(weekStart);
        day.setDate(weekStart.getDate() + d);
        return sumPaidInvoiceAmount(invoiceBase, day, endOfDay(day)).then((count) => ({
          label: DAY_LABELS[d],
          count,
        }));
      })
    );
  }

  if (period === "month") {
    const year = now.getFullYear();
    const month = now.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    return Promise.all(
      Array.from({ length: daysInMonth }, (_, i) => {
        const day = i + 1;
        const dayStart = new Date(year, month, day);
        const dayEnd = new Date(year, month, day, 23, 59, 59, 999);
        return sumPaidInvoiceAmount(invoiceBase, dayStart, dayEnd).then((count) => ({
          label: dayStart.toLocaleDateString("en", { month: "short", day: "numeric" }),
          count,
        }));
      })
    );
  }

  if (period === "year") {
    const year = now.getFullYear();
    return Promise.all(
      Array.from({ length: 12 }, (_, monthIndex) => {
        const start = new Date(year, monthIndex, 1);
        const end = new Date(year, monthIndex + 1, 0, 23, 59, 59, 999);
        return sumPaidInvoiceAmount(invoiceBase, start, end).then((count) => ({
          label: start.toLocaleDateString("en", { month: "short" }),
          count,
        }));
      })
    );
  }

  const paidFilter = resolveInsightsPaidAtFilter(period, now);
  if (paidFilter) {
    const allTimePaid = await sumPaidInvoiceAmount(invoiceBase, paidFilter.gte, paidFilter.lte);
    return [{ label: String(now.getFullYear()), count: allTimePaid }];
  }

  if (!isInsightsScopeUnrestricted(invoiceBase)) {
    const allTimePaid = await sumPaidInvoiceAmountAllTime(invoiceBase);
    return [{ label: String(now.getFullYear()), count: allTimePaid }];
  }

  const sqlRows: { bucket_start: Date; amount: bigint }[] =
    await prisma.$queryRaw`
        SELECT date_trunc('month', paid_at) AS bucket_start, COALESCE(SUM(amount), 0)::bigint AS amount
        FROM invoices
        WHERE status = 'paid'
          AND paid_at IS NOT NULL
        GROUP BY 1
        ORDER BY 1 ASC
        LIMIT ${ALL_TIME_MONTH_BUCKET_CAP}
      `;
  return sqlRows.map((row) => ({
    label: new Date(row.bucket_start).toLocaleDateString("en", {
      month: "short",
      year: "numeric",
    }),
    count: Number(row.amount),
  }));
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

/** Current calendar year by month — includes scheduled future dates in each month bucket. */
export async function fetchStatusOverTimeCalendarYear(
  base: Prisma.AppointmentWhereInput,
  now: Date
): Promise<{ month: string; done: number; pending: number; alert: number }[]> {
  const year = now.getFullYear();
  const tasks = Array.from({ length: 12 }, (_, monthIndex) => {
    const start = new Date(year, monthIndex, 1);
    const end = new Date(year, monthIndex + 1, 0, 23, 59, 59, 999);
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

export type InsightsStatusOverTimePoint = {
  /** X-axis label — field name `month` kept for stacked bar chart compatibility. */
  month: string;
  done: number;
  pending: number;
  alert: number;
};

/** Done / pending / alert counts inside one appointment start window. */
async function countStatusInRange(
  base: Prisma.AppointmentWhereInput,
  rangeStart: Date,
  rangeEnd: Date
): Promise<Pick<InsightsStatusOverTimePoint, "done" | "pending" | "alert">> {
  const rangeWhere: Prisma.AppointmentWhereInput = {
    ...base,
    start: { gte: rangeStart, lte: rangeEnd },
  };
  const [done, pending, alert] = await Promise.all([
    countAppointments(rangeWhere, { status: "done" }),
    countAppointments(rangeWhere, {
      OR: [{ status: "pending" }, { status: null }],
    }),
    countAppointments(rangeWhere, { status: "alert" }),
  ]);
  return { done, pending, alert };
}

/** Status stacked bars aligned with chart period — hour / weekday / day / month buckets. */
export async function fetchStatusOverTimeByPeriod(
  base: Prisma.AppointmentWhereInput,
  period: InsightsPeriod,
  now: Date
): Promise<InsightsStatusOverTimePoint[]> {
  if (period === "day") {
    const dayStart = startOfDay(now);
    return Promise.all(
      Array.from({ length: 24 }, (_, h) => {
        const hourStart = new Date(dayStart);
        hourStart.setHours(h, 0, 0, 0);
        const hourEnd = new Date(dayStart);
        hourEnd.setHours(h, 59, 59, 999);
        return countStatusInRange(base, hourStart, hourEnd).then((counts) => ({
          month: `${h}:00`,
          ...counts,
        }));
      })
    );
  }
  if (period === "week") {
    const weekStart = startOfWeek(now);
    return Promise.all(
      Array.from({ length: 7 }, (_, d) => {
        const dayStart = new Date(weekStart);
        dayStart.setDate(weekStart.getDate() + d);
        return countStatusInRange(base, dayStart, endOfDay(dayStart)).then((counts) => ({
          month: DAY_LABELS[d],
          ...counts,
        }));
      })
    );
  }
  if (period === "month") {
    const year = now.getFullYear();
    const month = now.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    return Promise.all(
      Array.from({ length: daysInMonth }, (_, i) => {
        const day = i + 1;
        const dayStart = new Date(year, month, day);
        return countStatusInRange(base, dayStart, endOfDay(dayStart)).then((counts) => ({
          month: dayStart.toLocaleDateString("en", { month: "short", day: "numeric" }),
          ...counts,
        }));
      })
    );
  }
  if (period === "year") {
    return fetchStatusOverTimeCalendarYear(base, now);
  }
  return fetchStatusOverTimeAllTime(base);
}

type WeekdaySqlRow = { dow: number; count: bigint };

/**
 * Weekday distribution for the active chart period — SQL `GROUP BY` DOW (no row cap).
 * PostgreSQL `EXTRACT(DOW)` is 0=Sun … 6=Sat (aligned with JS `getDay()`).
 */
export async function fetchBusiestDayOfWeekCounts(
  base: Prisma.AppointmentWhereInput,
  rangeStart: Date,
  rangeEnd: Date
): Promise<{ day: number; label: string; count: number }[]> {
  const ownerUserId = resolveAppointmentOwnerUserId(base);
  const sqlRows: WeekdaySqlRow[] = ownerUserId
    ? await prisma.$queryRaw<WeekdaySqlRow[]>`
        SELECT EXTRACT(DOW FROM "start")::int AS dow, COUNT(*)::bigint AS count
        FROM appointments
        WHERE (user_id = ${ownerUserId}::uuid OR treating_physician_id = ${ownerUserId}::uuid)
          AND "start" >= ${rangeStart}
          AND "start" <= ${rangeEnd}
        GROUP BY 1
      `
    : await prisma.$queryRaw<WeekdaySqlRow[]>`
        SELECT EXTRACT(DOW FROM "start")::int AS dow, COUNT(*)::bigint AS count
        FROM appointments
        WHERE "start" >= ${rangeStart}
          AND "start" <= ${rangeEnd}
        GROUP BY 1
      `;

  const dayCounts = [0, 0, 0, 0, 0, 0, 0];
  for (const row of sqlRows) {
    const dow = Number(row.dow);
    if (dow >= 0 && dow <= 6) {
      dayCounts[dow] = Number(row.count);
    }
  }
  return dayCounts.map((count, day) => ({ day, label: DAY_LABELS[day], count }));
}

/** Weekday mix for View-as period — all-time omits appointment date filter. */
export async function fetchBusiestDayOfWeekForPeriod(
  base: Prisma.AppointmentWhereInput,
  period: InsightsPeriod,
  now: Date
): Promise<{ day: number; label: string; count: number }[]> {
  const filter = resolveInsightsAppointmentStartFilter(period, now);
  if (!filter) {
    return fetchBusiestDayOfWeekAllTime(base);
  }
  return fetchBusiestDayOfWeekCounts(base, filter.gte, filter.lte);
}

async function fetchBusiestDayOfWeekAllTime(
  base: Prisma.AppointmentWhereInput
): Promise<{ day: number; label: string; count: number }[]> {
  const ownerUserId = resolveAppointmentOwnerUserId(base);
  const sqlRows: WeekdaySqlRow[] = ownerUserId
    ? await prisma.$queryRaw<WeekdaySqlRow[]>`
        SELECT EXTRACT(DOW FROM "start")::int AS dow, COUNT(*)::bigint AS count
        FROM appointments
        WHERE (user_id = ${ownerUserId}::uuid OR treating_physician_id = ${ownerUserId}::uuid)
        GROUP BY 1
      `
    : await prisma.$queryRaw<WeekdaySqlRow[]>`
        SELECT EXTRACT(DOW FROM "start")::int AS dow, COUNT(*)::bigint AS count
        FROM appointments
        GROUP BY 1
      `;

  const dayCounts = [0, 0, 0, 0, 0, 0, 0];
  for (const row of sqlRows) {
    const dow = Number(row.dow);
    if (dow >= 0 && dow <= 6) {
      dayCounts[dow] = Number(row.count);
    }
  }
  return dayCounts.map((count, day) => ({ day, label: DAY_LABELS[day], count }));
}

export async function fetchCategoryBreakdownForPeriod(
  base: Prisma.AppointmentWhereInput,
  period: InsightsPeriod,
  now: Date
): Promise<Record<string, number>> {
  const filter = resolveInsightsAppointmentStartFilter(period, now);
  if (!filter) {
    return fetchCategoryBreakdownAllTime(base);
  }
  return fetchCategoryBreakdown(base, filter.gte, filter.lte);
}

async function fetchCategoryBreakdownAllTime(
  base: Prisma.AppointmentWhereInput
): Promise<Record<string, number>> {
  const rows = await prisma.appointment.groupBy({
    by: ["category_id"],
    where: base,
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

export async function fetchTypeBreakdownForPeriod(
  base: Prisma.AppointmentWhereInput,
  period: InsightsPeriod,
  now: Date
): Promise<{ name: string; count: number }[]> {
  const filter = resolveInsightsAppointmentStartFilter(period, now);
  if (!filter) {
    return fetchTypeBreakdownAllTime(base);
  }
  return fetchTypeBreakdown(base, filter.gte, filter.lte);
}

async function fetchTypeBreakdownAllTime(
  base: Prisma.AppointmentWhereInput
): Promise<{ name: string; count: number }[]> {
  const rows = await prisma.appointment.groupBy({
    by: ["appointment_type_id"],
    where: base,
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

export async function fetchTopPatientsForPeriod(
  base: Prisma.AppointmentWhereInput,
  period: InsightsPeriod,
  now: Date,
  limit = 10
): Promise<
  {
    id: string;
    name: string;
    firstname: string;
    lastname: string;
    email: string | null;
    birth_date: string | null;
    care_level: number | null;
    clinical_profile?: { image_url?: string } | null;
    count: number;
  }[]
> {
  const filter = resolveInsightsAppointmentStartFilter(period, now);
  if (!filter) {
    return fetchTopPatientsAllTime(base, limit);
  }
  return fetchTopPatients(base, filter.gte, filter.lte, limit);
}

async function fetchTopPatientsAllTime(
  base: Prisma.AppointmentWhereInput,
  limit = 10
): Promise<
  {
    id: string;
    name: string;
    firstname: string;
    lastname: string;
    email: string | null;
    birth_date: string | null;
    care_level: number | null;
    clinical_profile?: { image_url?: string } | null;
    count: number;
  }[]
> {
  const rows = await prisma.appointment.groupBy({
    by: ["patient_id"],
    where: { ...base, patient_id: { not: null } },
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
          select: {
            id: true,
            firstname: true,
            lastname: true,
            email: true,
            birth_date: true,
            care_level: true,
            clinical_profile: true,
          },
        })
      : [];
  const patientById = new Map(patients.map((p) => [p.id, p]));
  return topRows.map((row) => ({
    id: row.patient_id ?? "unknown",
    name: row.patient_id
      ? `${patientById.get(row.patient_id)?.firstname ?? ""} ${patientById.get(row.patient_id)?.lastname ?? ""}`.trim() ||
        "Unknown"
      : "Unknown",
    firstname: row.patient_id ? patientById.get(row.patient_id)?.firstname ?? "" : "",
    lastname: row.patient_id ? patientById.get(row.patient_id)?.lastname ?? "" : "",
    email: row.patient_id ? patientById.get(row.patient_id)?.email ?? null : null,
    birth_date: row.patient_id
      ? patientById.get(row.patient_id)?.birth_date?.toISOString() ?? null
      : null,
    care_level: row.patient_id ? patientById.get(row.patient_id)?.care_level ?? null : null,
    clinical_profile: row.patient_id
      ? (patientById.get(row.patient_id)?.clinical_profile as { image_url?: string } | null)
      : null,
    count: row._count._all,
  }));
}

export async function fetchTopPatients(
  base: Prisma.AppointmentWhereInput,
  rangeStart: Date,
  rangeEnd: Date,
  limit = 10
): Promise<
  {
    id: string;
    name: string;
    firstname: string;
    lastname: string;
    email: string | null;
    birth_date: string | null;
    care_level: number | null;
    clinical_profile?: { image_url?: string } | null;
    count: number;
  }[]
> {
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
          select: {
            id: true,
            firstname: true,
            lastname: true,
            email: true,
            birth_date: true,
            care_level: true,
            clinical_profile: true,
          },
        })
      : [];
  const patientById = new Map(patients.map((p) => [p.id, p]));
  return topRows.map((row) => ({
    id: row.patient_id ?? "unknown",
    name: row.patient_id
      ? `${patientById.get(row.patient_id)?.firstname ?? ""} ${patientById.get(row.patient_id)?.lastname ?? ""}`.trim() ||
        "Unknown"
      : "Unknown",
    firstname: row.patient_id ? patientById.get(row.patient_id)?.firstname ?? "" : "",
    lastname: row.patient_id ? patientById.get(row.patient_id)?.lastname ?? "" : "",
    email: row.patient_id ? patientById.get(row.patient_id)?.email ?? null : null,
    birth_date: row.patient_id
      ? patientById.get(row.patient_id)?.birth_date?.toISOString() ?? null
      : null,
    care_level: row.patient_id ? patientById.get(row.patient_id)?.care_level ?? null : null,
    clinical_profile: row.patient_id
      ? (patientById.get(row.patient_id)?.clinical_profile as { image_url?: string } | null)
      : null,
    count: row._count._all,
  }));
}

/** Volume trend for period=month — one bucket per calendar day (includes future days in month). */
export async function fetchTrendCountsCalendarMonth(
  base: Prisma.AppointmentWhereInput,
  now: Date
): Promise<InsightsTrendPoint[]> {
  const year = now.getFullYear();
  const month = now.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  return Promise.all(
    Array.from({ length: daysInMonth }, (_, i) => {
      const day = i + 1;
      const dayStart = new Date(year, month, day);
      const dayEnd = new Date(year, month, day, 23, 59, 59, 999);
      return countAppointments(base, {
        start: { gte: dayStart, lte: dayEnd },
      }).then((count) => ({
        label: dayStart.toLocaleDateString("en", { month: "short", day: "numeric" }),
        count,
      }));
    })
  );
}

/** Volume trend for period=year — Jan–Dec of the active calendar year. */
export async function fetchTrendCountsCalendarYear(
  base: Prisma.AppointmentWhereInput,
  now: Date
): Promise<InsightsTrendPoint[]> {
  const year = now.getFullYear();
  return Promise.all(
    Array.from({ length: 12 }, (_, monthIndex) => {
      const start = new Date(year, monthIndex, 1);
      const end = new Date(year, monthIndex + 1, 0, 23, 59, 59, 999);
      return countAppointments(base, {
        start: { gte: start, lte: end },
      }).then((count) => ({
        label: start.toLocaleDateString("en", { month: "short" }),
        count,
      }));
    })
  );
}

type AllTimeBucketSqlRow = { bucket_start: Date; count: bigint };

const ALL_TIME_YEAR_BUCKET_CAP = 15;
const ALL_TIME_MONTH_BUCKET_CAP = 24;
const ONE_YEAR_MS = 365.25 * 24 * 60 * 60 * 1000;

async function resolveAllTimeUsesMonthlyBuckets(
  base: Prisma.AppointmentWhereInput
): Promise<boolean> {
  const ownerUserId = resolveAppointmentOwnerUserId(base);
  const bounds = ownerUserId
    ? await prisma.$queryRaw<{ min_start: Date | null; max_start: Date | null }[]>`
        SELECT MIN("start") AS min_start, MAX("start") AS max_start
        FROM appointments
        WHERE (user_id = ${ownerUserId}::uuid OR treating_physician_id = ${ownerUserId}::uuid)
      `
    : await prisma.$queryRaw<{ min_start: Date | null; max_start: Date | null }[]>`
        SELECT MIN("start") AS min_start, MAX("start") AS max_start
        FROM appointments
      `;
  const minStart = bounds[0]?.min_start;
  const maxStart = bounds[0]?.max_start;
  if (!minStart || !maxStart) return false;
  return maxStart.getTime() - minStart.getTime() <= ONE_YEAR_MS;
}

/** Volume trend for period=all — yearly buckets (cap 15) or monthly when span ≤ 1 year. */
export async function fetchTrendCountsAllTime(
  base: Prisma.AppointmentWhereInput
): Promise<InsightsTrendPoint[]> {
  const useMonthly = await resolveAllTimeUsesMonthlyBuckets(base);
  const ownerUserId = resolveAppointmentOwnerUserId(base);

  if (useMonthly) {
    const sqlRows: AllTimeBucketSqlRow[] = ownerUserId
      ? await prisma.$queryRaw<AllTimeBucketSqlRow[]>`
          SELECT date_trunc('month', "start") AS bucket_start, COUNT(*)::bigint AS count
          FROM appointments
          WHERE (user_id = ${ownerUserId}::uuid OR treating_physician_id = ${ownerUserId}::uuid)
          GROUP BY 1
          ORDER BY 1 ASC
          LIMIT ${ALL_TIME_MONTH_BUCKET_CAP}
        `
      : await prisma.$queryRaw<AllTimeBucketSqlRow[]>`
          SELECT date_trunc('month', "start") AS bucket_start, COUNT(*)::bigint AS count
          FROM appointments
          GROUP BY 1
          ORDER BY 1 ASC
          LIMIT ${ALL_TIME_MONTH_BUCKET_CAP}
        `;
    return sqlRows.map((row) => ({
      label: new Date(row.bucket_start).toLocaleDateString("en", {
        month: "short",
        year: "numeric",
      }),
      count: Number(row.count),
    }));
  }

  const sqlRows: AllTimeBucketSqlRow[] = ownerUserId
    ? await prisma.$queryRaw<AllTimeBucketSqlRow[]>`
        SELECT date_trunc('year', "start") AS bucket_start, COUNT(*)::bigint AS count
        FROM appointments
        WHERE (user_id = ${ownerUserId}::uuid OR treating_physician_id = ${ownerUserId}::uuid)
        GROUP BY 1
        ORDER BY 1 ASC
        LIMIT ${ALL_TIME_YEAR_BUCKET_CAP}
      `
    : await prisma.$queryRaw<AllTimeBucketSqlRow[]>`
        SELECT date_trunc('year', "start") AS bucket_start, COUNT(*)::bigint AS count
        FROM appointments
        GROUP BY 1
        ORDER BY 1 ASC
        LIMIT ${ALL_TIME_YEAR_BUCKET_CAP}
      `;
  return sqlRows.map((row) => ({
    label: String(new Date(row.bucket_start).getFullYear()),
    count: Number(row.count),
  }));
}

/** Status stacked bars for period=all — same bucket strategy as volume trend. */
export async function fetchStatusOverTimeAllTime(
  base: Prisma.AppointmentWhereInput
): Promise<InsightsStatusOverTimePoint[]> {
  const trend = await fetchTrendCountsAllTime(base);
  if (trend.length === 0) return [];

  const useMonthly = trend[0]?.label.includes(",");
  const ownerUserId = resolveAppointmentOwnerUserId(base);

  if (useMonthly) {
    const sqlRows: { bucket_start: Date; done: bigint; pending: bigint; alert: bigint }[] =
      ownerUserId
        ? await prisma.$queryRaw`
            SELECT date_trunc('month', "start") AS bucket_start,
              COUNT(*) FILTER (WHERE status = 'done')::bigint AS done,
              COUNT(*) FILTER (WHERE status = 'pending' OR status IS NULL)::bigint AS pending,
              COUNT(*) FILTER (WHERE status = 'alert')::bigint AS alert
            FROM appointments
            WHERE (user_id = ${ownerUserId}::uuid OR treating_physician_id = ${ownerUserId}::uuid)
            GROUP BY 1
            ORDER BY 1 ASC
            LIMIT ${ALL_TIME_MONTH_BUCKET_CAP}
          `
        : await prisma.$queryRaw`
            SELECT date_trunc('month', "start") AS bucket_start,
              COUNT(*) FILTER (WHERE status = 'done')::bigint AS done,
              COUNT(*) FILTER (WHERE status = 'pending' OR status IS NULL)::bigint AS pending,
              COUNT(*) FILTER (WHERE status = 'alert')::bigint AS alert
            FROM appointments
            GROUP BY 1
            ORDER BY 1 ASC
            LIMIT ${ALL_TIME_MONTH_BUCKET_CAP}
          `;
    return sqlRows.map((row) => ({
      month: new Date(row.bucket_start).toLocaleDateString("en", {
        month: "short",
        year: "numeric",
      }),
      done: Number(row.done),
      pending: Number(row.pending),
      alert: Number(row.alert),
    }));
  }

  const sqlRows: { bucket_start: Date; done: bigint; pending: bigint; alert: bigint }[] =
    ownerUserId
      ? await prisma.$queryRaw`
          SELECT date_trunc('year', "start") AS bucket_start,
            COUNT(*) FILTER (WHERE status = 'done')::bigint AS done,
            COUNT(*) FILTER (WHERE status = 'pending' OR status IS NULL)::bigint AS pending,
            COUNT(*) FILTER (WHERE status = 'alert')::bigint AS alert
          FROM appointments
          WHERE (user_id = ${ownerUserId}::uuid OR treating_physician_id = ${ownerUserId}::uuid)
          GROUP BY 1
          ORDER BY 1 ASC
          LIMIT ${ALL_TIME_YEAR_BUCKET_CAP}
        `
      : await prisma.$queryRaw`
          SELECT date_trunc('year', "start") AS bucket_start,
            COUNT(*) FILTER (WHERE status = 'done')::bigint AS done,
            COUNT(*) FILTER (WHERE status = 'pending' OR status IS NULL)::bigint AS pending,
            COUNT(*) FILTER (WHERE status = 'alert')::bigint AS alert
          FROM appointments
          GROUP BY 1
          ORDER BY 1 ASC
          LIMIT ${ALL_TIME_YEAR_BUCKET_CAP}
        `;
  return sqlRows.map((row) => ({
    month: String(new Date(row.bucket_start).getFullYear()),
    done: Number(row.done),
    pending: Number(row.pending),
    alert: Number(row.alert),
  }));
}

export async function fetchAgeDistributionForPeriod(
  base: Prisma.AppointmentWhereInput,
  period: InsightsPeriod,
  now: Date
): Promise<{ label: string; count: number }[]> {
  const filter = resolveInsightsAppointmentStartFilter(period, now);
  if (!filter) {
    return fetchAgeDistributionAllTime(base, now);
  }
  return fetchAgeDistribution(base, filter.gte, filter.lte, now);
}

async function fetchAgeDistributionAllTime(
  base: Prisma.AppointmentWhereInput,
  now: Date
): Promise<{ label: string; count: number }[]> {
  const patientRows = await prisma.appointment.findMany({
    where: { ...base, patient_id: { not: null } },
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

/** Distinct patients for View-as period — all-time counts every scoped patient. */
export async function countDistinctPatientsForPeriod(
  base: Prisma.AppointmentWhereInput,
  period: InsightsPeriod,
  now: Date
): Promise<number> {
  if (isInsightsPeriodAll(period)) {
    const rows = await prisma.appointment.groupBy({
      by: ["patient_id"],
      where: { ...base, patient_id: { not: null } },
    });
    return rows.length;
  }
  const range = resolveDateRangeInclusive(period, now);
  return countDistinctPatientsInRange(base, range.start, range.end);
}

/** Distinct patients from period start through now — all-time equals activeInPeriod. */
export async function countDistinctPatientsInPeriodToNowForPeriod(
  base: Prisma.AppointmentWhereInput,
  period: InsightsPeriod,
  now: Date
): Promise<number> {
  if (isInsightsPeriodAll(period)) {
    return countDistinctPatientsForPeriod(base, period, now);
  }
  const range = resolveDateRangeInclusive(period, now);
  return countDistinctPatientsInPeriodToNow(base, range.start, range.end, now);
}

/** Trend buckets for selected period — count queries, no full appointment rows. */
export async function fetchTrendCountsByPeriod(
  base: Prisma.AppointmentWhereInput,
  period: InsightsPeriod,
  now: Date
): Promise<InsightsTrendPoint[]> {
  if (period === "all") {
    return fetchTrendCountsAllTime(base);
  }
  if (period === "day") {
    const dayStart = startOfDay(now);
    return Promise.all(
      Array.from({ length: 24 }, (_, h) => {
        const hourStart = new Date(dayStart);
        hourStart.setHours(h, 0, 0, 0);
        const hourEnd = new Date(dayStart);
        hourEnd.setHours(h, 59, 59, 999);
        return countAppointments(base, {
          start: { gte: hourStart, lte: hourEnd },
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
          start: { gte: dayStart, lte: dayEnd },
        }).then((count) => ({ label: DAY_LABELS[d], count }));
      })
    );
  }
  if (period === "month") {
    return fetchTrendCountsCalendarMonth(base, now);
  }
  return fetchTrendCountsCalendarYear(base, now);
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

/** Distinct patients with appointments in period — end clipped to `now` (excludes future slots). */
export async function countDistinctPatientsInPeriodToNow(
  base: Prisma.AppointmentWhereInput,
  rangeStart: Date,
  rangeEnd: Date,
  now: Date
): Promise<number> {
  const end = rangeEnd.getTime() > now.getTime() ? now : rangeEnd;
  const rows = await prisma.appointment.groupBy({
    by: ["patient_id"],
    where: {
      ...base,
      start: { gte: rangeStart, lte: end },
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

/** @deprecated Import from insights-doctor-aggregate — re-exported for legacy tests. */
export { fetchDoctorBreakdown } from "@/lib/insights/insights-doctor-aggregate";
