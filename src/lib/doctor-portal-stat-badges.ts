/**
 * Doctor portal KPI title badges — compact outline pills (matches `PatientStatCard` string chips).
 */

import {
  format,
  isSameDay,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import type { DailyAppointmentStats } from "@/lib/appointment-stats";

const WEEK_OPTS = { weekStartsOn: 1 as const };

function formatShortDay(d: Date): string {
  return format(d, "MMM d");
}

function withPassedSuffix(rangeLabel: string, passedCount: number): string {
  return passedCount > 0 ? `${rangeLabel} · ${passedCount} passed` : rangeLabel;
}

/** Mon (week start) → today, optional passed count. */
export function doctorPortalWeekPeriodBadgeLabel(
  passedCount: number,
  referenceDate: Date = new Date()
): string {
  const start = startOfWeek(referenceDate, WEEK_OPTS);
  const range = isSameDay(start, referenceDate)
    ? formatShortDay(referenceDate)
    : `${format(start, "EEE d")} – ${formatShortDay(referenceDate)}`;
  return withPassedSuffix(range, passedCount);
}

/** Month 1st → today, optional passed count. */
export function doctorPortalMonthPeriodBadgeLabel(
  passedCount: number,
  referenceDate: Date = new Date()
): string {
  const start = startOfMonth(referenceDate);
  const range = isSameDay(start, referenceDate)
    ? formatShortDay(referenceDate)
    : `${formatShortDay(start)} – ${formatShortDay(referenceDate)}`;
  return withPassedSuffix(range, passedCount);
}

/** Today tile — same single-line chip style as week/month (dashboard status semantics). */
export function doctorPortalTodayStatusBadgeLabel(
  stats: Pick<DailyAppointmentStats, "open" | "alert" | "done">
): string {
  return `Open: ${stats.open} · Alert: ${stats.alert} · Done: ${stats.done}`;
}

/** Pending tile — practice-wide alert count (numeric pending stays in the value slot). */
export function doctorPortalAlertOverallBadgeLabel(alertCount: number): string | undefined {
  if (alertCount <= 0) return undefined;
  return `Alert: ${alertCount}`;
}
