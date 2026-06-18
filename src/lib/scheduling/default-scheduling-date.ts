/**
 * Pick the default calendar day when opening scheduling (patient + staff booking).
 * Defaults to today unless the month map marks it unavailable (no clinic hours).
 * "full" days still default to today — day grid may have remaining bookable slots.
 */

import type { MonthDayEntry, MonthDayStatus } from "@/lib/scheduling/scheduling-types";

/** yyyy-MM-dd lexical compare — safe for ISO date strings. */
function compareDateStr(a: string, b: string): number {
  return a.localeCompare(b);
}

/** Calendar click disabled only for explicit non-bookable days (not "full"). */
export function isSchedulingMonthDayDisabled(status: MonthDayStatus | undefined): boolean {
  return status === "unavailable";
}

/**
 * First default day when parent `dateStr` is empty.
 * Prefer today when bookable or merely full; skip only when unavailable.
 */
export function resolveDefaultSchedulingDateStr(
  today: string,
  days: MonthDayEntry[]
): string | null {
  if (!today || days.length === 0) return null;

  const todayEntry = days.find((d) => d.date === today);
  if (!todayEntry || todayEntry.status !== "unavailable") {
    return today;
  }

  const candidates = days
    .filter((d) => d.status === "open" && compareDateStr(d.date, today) > 0)
    .sort((a, b) => compareDateStr(a.date, b.date));

  return candidates[0]?.date ?? null;
}
