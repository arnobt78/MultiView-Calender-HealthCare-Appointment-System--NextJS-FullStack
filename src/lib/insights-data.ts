/**
 * insights-data.ts — Shared data computation layer for the Insights/Analytics pages.
 *
 * getInsightsData() is called by:
 *   - GET /api/insights (with role-based ownOnly flag)
 *   - prefetchInsights() for SSR cache seeding
 *
 * organizationWide = true  → global aggregate (all appointments / paid invoices)
 * organizationWide = false → visits owner OR treating + doctor-scoped invoices (portal parity)
 * Legacy ownOnly maps to the inverse of organizationWide (see insights-scope.ts).
 *
 * Extended payload includes additional metrics added in v006 schema migration:
 *   - avgDurationMinutes, newPatientsThisMonth, busiestDayOfWeek
 *   - revenueThisMonth, revenuePrevMonth (for delta % display)
 *   - telehealthPct from fetchTelehealthShareForPeriod (View-as `start` window, like pending)
 *   - statusOverTime (stacked bar: done/pending/alert buckets follow chart period)
 *   - appointmentTypeBreakdown (by type name, count)
 */

import type { InsightsDataOptions } from "@/lib/insights-scope";
import type { InsightsPeriod } from "@/lib/insights/insights-period";
import { formatInsightsPeriodDisplayLabel } from "@/lib/insights/insights-period-label";
import { resolveInsightsScopeLabelForMeta } from "@/lib/insights-scope-display";
import type { InsightsPayloadV2 } from "@/lib/insights/insights-types";
import { legacyMonthlyDataFromTrend } from "@/lib/insights/insights-legacy-payload";
import { fetchDoctorInsightsSection } from "@/lib/insights/insights-doctor-aggregate";
import {
  buildInsightsScopeBases,
  countNewPatientsInMonth,
  countDistinctPatientsForPeriod,
  countDistinctPatientsInPeriodToNowForPeriod,
  fetchAgeDistributionForPeriod,
  fetchAppointmentTotals,
  fetchAvgDurationMinutesForPeriod,
  fetchBusiestDayOfWeekForPeriod,
  fetchCategoryBreakdownForPeriod,
  fetchPaymentSuccessPct,
  fetchRevenueAggregates,
  fetchRevenueTrendByPeriod,
  fetchStatusOverTimeByPeriod,
  fetchTopPatientsForPeriod,
  fetchTrendCountsByPeriod,
  fetchTypeBreakdownForPeriod,
  countAppointmentsByStatusForPeriod,
  fetchTelehealthShareForPeriod,
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
  topPatients: {
    id: string;
    name: string;
    firstname: string;
    lastname: string;
    email: string | null;
    birth_date: string | null;
    care_level: number | null;
    clinical_profile?: { image_url?: string } | null;
    count: number;
  }[];
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

  const { organizationWide, period, filterOwnerId } = resolved;

  const now = new Date();
  const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const { apptBase, invoiceBase } = await buildInsightsScopeBases(resolved);

  const [
    totals,
    byStatus,
    telehealthShare,
    avgDurationMinutes,
    revenueAgg,
    paymentSuccessPct,
    doctorsSection,
    statusOverTime,
    busiestDayOfWeek,
    byCategory,
    appointmentTypeBreakdown,
    topPatients,
    ageDistribution,
    trend,
    revenueTrend,
    newPatientsInPeriod,
    newPatientsThisMonth,
    activeInPeriod,
    scopeLabel,
  ] = await Promise.all([
    fetchAppointmentTotals(apptBase, now),
    countAppointmentsByStatusForPeriod(apptBase, period, now),
    fetchTelehealthShareForPeriod(apptBase, period, now),
    fetchAvgDurationMinutesForPeriod(apptBase, period, now),
    fetchRevenueAggregates(invoiceBase, period, now),
    fetchPaymentSuccessPct(invoiceBase),
    fetchDoctorInsightsSection({
      organizationWide,
      filterOwnerId,
      period,
      now,
    }),
    fetchStatusOverTimeByPeriod(apptBase, period, now),
    fetchBusiestDayOfWeekForPeriod(apptBase, period, now),
    fetchCategoryBreakdownForPeriod(apptBase, period, now),
    fetchTypeBreakdownForPeriod(apptBase, period, now),
    fetchTopPatientsForPeriod(apptBase, period, now),
    fetchAgeDistributionForPeriod(apptBase, period, now),
    fetchTrendCountsByPeriod(apptBase, period, now),
    fetchRevenueTrendByPeriod(invoiceBase, period, now),
    countDistinctPatientsInPeriodToNowForPeriod(apptBase, period, now),
    countNewPatientsInMonth(apptBase, startOfThisMonth, now),
    countDistinctPatientsForPeriod(apptBase, period, now),
    resolveInsightsScopeLabelForMeta(userId, resolved),
  ]);

  const total = totals.all;
  const done = byStatus.done ?? 0;
  const pending = (byStatus.pending ?? 0) + (byStatus[""] ?? 0);
  const upcoming = totals.upcoming;
  const overdue = totals.overdue;
  const thisMonth = totals.thisMonth;

  const revenueThisMonth = revenueAgg.paidInPeriod;
  const revenuePrevMonth = revenueAgg.paidPrevPeriod;

  const telehealthPct = telehealthShare.telehealthPct;

  const monthlyData = legacyMonthlyDataFromTrend(trend, period);

  const v2: InsightsPayloadV2 = {
    meta: {
      period,
      periodLabel: formatInsightsPeriodDisplayLabel(period, now),
      scopeLabel,
      generatedAt: now.toISOString(),
      organizationWide,
    },
    appointments: {
      totals: {
        ...totals,
        done,
        pending,
        telehealthCount: telehealthShare.telehealthCount,
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
      newInPeriod: newPatientsInPeriod,
      activeInPeriod,
      ageDistribution,
      topPatients,
    },
    revenue: {
      paidInPeriod: revenueThisMonth,
      paidPrevPeriod: revenuePrevMonth,
      paidInPeriodCount: revenueAgg.paidInPeriodCount,
      invoiceByStatus: revenueAgg.invoiceByStatus,
      statusTotals: revenueAgg.statusTotals,
      revenueTrend,
      paymentSuccessPct,
      avgInvoiceCents:
        revenueAgg.invoiceByStatus.paid && revenueAgg.invoiceByStatus.paid > 0
          ? Math.round(revenueThisMonth / (revenueAgg.invoiceByStatus.paid || 1))
          : 0,
    },
    doctors: doctorsSection,
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
