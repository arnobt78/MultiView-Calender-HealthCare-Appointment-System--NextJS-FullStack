/**
 * insights-data.ts — Shared data computation layer for the Insights/Analytics pages.
 *
 * getInsightsData() is called by:
 *   - GET /api/insights (with role-based ownOnly flag)
 *   - prefetchInsights() for SSR cache seeding
 *
 * organizationWide = true  → global aggregate (all appointments / paid invoices)
 * organizationWide = false → filters to owner_id / invoice user_id = filterOwnerId
 * Legacy ownOnly maps to the inverse of organizationWide (see insights-scope.ts).
 *
 * Extended payload includes additional metrics added in v006 schema migration:
 *   - avgDurationMinutes, newPatientsThisMonth, busiestDayOfWeek
 *   - revenueThisMonth, revenuePrevMonth (for delta % display)
 *   - statusOverTime (stacked bar: done/pending/alert buckets follow chart period)
 *   - appointmentTypeBreakdown (by type name, count)
 */

import type { InsightsDataOptions } from "@/lib/insights-scope";
import type { InsightsPeriod } from "@/lib/insights/insights-period";
import { resolveDateRangeInclusive } from "@/lib/insights/insights-period";
import type { InsightsPayloadV2 } from "@/lib/insights/insights-types";
import { legacyMonthlyDataFromTrend } from "@/lib/insights/insights-legacy-payload";
import {
  appointmentOwnerWhere,
  countNewPatientsInMonth,
  countDistinctPatientsInRange,
  fetchAgeDistribution,
  fetchAppointmentTotals,
  fetchAvgDurationMinutes,
  fetchBusiestDayOfWeekCounts,
  fetchCategoryBreakdown,
  fetchDoctorBreakdown,
  fetchPaymentSuccessPct,
  fetchRevenueAggregates,
  fetchStatusOverTimeByPeriod,
  fetchTopPatients,
  fetchTrendCountsByPeriod,
  fetchTypeBreakdown,
  countAppointmentsByStatus,
  invoiceOwnerWhere,
} from "@/lib/insights/insights-aggregate";

export type { InsightsDataOptions };

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
  /** Deprecated flat series — derived from `v2.appointments.trend` (no extra DB query). */
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
  /** v2 structured sections — charts and overview row */
  v2?: InsightsPayloadV2;
}

/**
 * Compute insights data.
 * @param userId   The requesting user's ID (used for own-scope filtering)
 * @param options  ownOnly: restrict queries to owner_id = userId when true
 */
export type GetInsightsDataInput = InsightsDataOptions & {
  period?: InsightsPeriod;
};

export async function getInsightsData(
  userId: string,
  options: GetInsightsDataInput | { ownOnly?: boolean; ownerId?: string } = {}
): Promise<InsightsPayload> {
  const resolved: InsightsDataOptions & { period: InsightsPeriod } =
    "organizationWide" in options
      ? {
          organizationWide: options.organizationWide,
          filterOwnerId: options.filterOwnerId,
          period: options.period ?? "month",
        }
      : {
          organizationWide: options.ownOnly === false,
          filterOwnerId: options.ownerId?.trim() || userId,
          period: "month",
        };

  const { organizationWide, period } = resolved;

  const now = new Date();
  const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const periodRange = resolveDateRangeInclusive(period, now);

  const apptBase = appointmentOwnerWhere(resolved);
  const invoiceBase = invoiceOwnerWhere(resolved);

  const [
    totals,
    byStatus,
    avgDurationMinutes,
    revenueAgg,
    paymentSuccessPct,
    doctorRows,
    statusOverTime,
    busiestDayOfWeek,
    byCategory,
    appointmentTypeBreakdown,
    topPatients,
    ageDistribution,
    trend,
    newPatientsThisMonth,
    activeInPeriod,
  ] = await Promise.all([
    fetchAppointmentTotals(apptBase, now),
    countAppointmentsByStatus(apptBase),
    fetchAvgDurationMinutes(apptBase),
    fetchRevenueAggregates(invoiceBase, period, now),
    fetchPaymentSuccessPct(invoiceBase),
    fetchDoctorBreakdown(organizationWide),
    fetchStatusOverTimeByPeriod(apptBase, period, now),
    fetchBusiestDayOfWeekCounts(apptBase, periodRange.start, periodRange.end),
    fetchCategoryBreakdown(apptBase, periodRange.start, periodRange.end),
    fetchTypeBreakdown(apptBase, periodRange.start, periodRange.end),
    fetchTopPatients(apptBase, periodRange.start, periodRange.end),
    fetchAgeDistribution(apptBase, periodRange.start, periodRange.end, now),
    // Volume trend + revenue area chart — period=month (daily) | year (Jan–Dec), not rolling 12mo.
    fetchTrendCountsByPeriod(apptBase, period, now),
    countNewPatientsInMonth(apptBase, startOfThisMonth, now),
    countDistinctPatientsInRange(apptBase, periodRange.start, periodRange.end),
  ]);

  const total = totals.all;
  const done = byStatus.done ?? 0;
  const pending = (byStatus.pending ?? 0) + (byStatus[""] ?? 0);
  const upcoming = totals.upcoming;
  const overdue = totals.overdue;
  const thisMonth = totals.thisMonth;

  const revenueThisMonth = revenueAgg.paidInPeriod;
  const revenuePrevMonth = revenueAgg.paidPrevPeriod;

  const specialtyCounts: Record<string, number> = {};
  if (doctorRows) {
    for (const row of doctorRows) {
      const key = row.specialty?.trim() || "Unspecified";
      specialtyCounts[key] = (specialtyCounts[key] ?? 0) + row.appointmentCount;
    }
  }

  const telehealthPct =
    totals.all > 0 ? Math.round((totals.telehealthCount / totals.all) * 100) : 0;

  const monthlyData = legacyMonthlyDataFromTrend(trend, period);

  const v2: InsightsPayloadV2 = {
    meta: {
      period,
      periodLabel: periodRange.label,
      generatedAt: now.toISOString(),
      organizationWide,
    },
    appointments: {
      totals: {
        ...totals,
        done,
        pending,
        telehealthPct,
        avgDurationMinutes,
      },
      byStatus,
      byCategory,
      trend,
      busiestDayOfWeek,
      statusOverTime,
      typeBreakdown: appointmentTypeBreakdown,
    },
    patients: {
      newInPeriod: newPatientsThisMonth,
      activeInPeriod,
      ageDistribution,
      topPatients,
    },
    revenue: {
      paidInPeriod: revenueThisMonth,
      paidPrevPeriod: revenuePrevMonth,
      invoiceByStatus: revenueAgg.invoiceByStatus,
      revenueTrend: trend,
      paymentSuccessPct,
      avgInvoiceCents:
        revenueAgg.invoiceByStatus.paid && revenueAgg.invoiceByStatus.paid > 0
          ? Math.round(revenueThisMonth / (revenueAgg.invoiceByStatus.paid || 1))
          : 0,
    },
    doctors: doctorRows
      ? {
          byDoctor: doctorRows,
          bySpecialty: Object.entries(specialtyCounts).map(([specialty, count]) => ({
            specialty,
            count,
          })),
        }
      : null,
  };

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
    v2,
  };
}
