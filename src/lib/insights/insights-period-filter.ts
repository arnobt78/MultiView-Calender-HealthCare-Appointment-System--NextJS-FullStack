/**
 * Single source for insights View-as date filters.
 * Scalar metrics use no `start` filter when period=all; time-series charts use SQL bucket helpers.
 */

import type { Prisma } from "@prisma/client";
import type { InsightsPeriod } from "@/lib/insights/insights-period";
import {
  INSIGHTS_ALL_TIME_RANGE_END,
  INSIGHTS_ALL_TIME_RANGE_START,
  isInsightsPeriodAll,
  resolveDateRange,
  resolveDateRangeInclusive,
} from "@/lib/insights/insights-period";

/** Appointment `start` window for chart period — undefined means no date filter. */
export function resolveInsightsAppointmentStartFilter(
  period: InsightsPeriod,
  now = new Date()
): { gte: Date; lte: Date } | undefined {
  if (isInsightsPeriodAll(period)) return undefined;
  const range = resolveDateRangeInclusive(period, now);
  return { gte: range.start, lte: range.end };
}

/** Paid invoice `paid_at` window (clipped to now) — undefined for all-time. */
export function resolveInsightsPaidAtFilter(
  period: InsightsPeriod,
  now = new Date()
): { gte: Date; lte: Date } | undefined {
  if (isInsightsPeriodAll(period)) return undefined;
  const range = resolveDateRange(period, now);
  return { gte: range.start, lte: range.end };
}

/** DoctorTimeOff overlap window — undefined for all-time (no date predicate). */
export function resolveInsightsTimeOffOverlapFilter(
  period: InsightsPeriod,
  now = new Date()
): { rangeStart: Date; rangeEnd: Date } | undefined {
  if (isInsightsPeriodAll(period)) return undefined;
  const range = resolveDateRangeInclusive(period, now);
  return { rangeStart: range.start, rangeEnd: range.end };
}

/** Display-only sentinel range for all-time labels (not for Prisma filters). */
export function insightsAllTimeDisplayRange(): {
  start: Date;
  end: Date;
} {
  return {
    start: INSIGHTS_ALL_TIME_RANGE_START,
    end: INSIGHTS_ALL_TIME_RANGE_END,
  };
}

/** Merge scoped appointment base with optional period start filter. */
export function withAppointmentStartInPeriod(
  base: Prisma.AppointmentWhereInput,
  period: InsightsPeriod,
  now = new Date()
): Prisma.AppointmentWhereInput {
  const start = resolveInsightsAppointmentStartFilter(period, now);
  if (!start) return base;
  return { ...base, start };
}
