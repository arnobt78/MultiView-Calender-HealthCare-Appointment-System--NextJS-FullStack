/**
 * Display helpers for doctor weekly schedule UI — grouping, time conversion, TZ hints.
 */

import { format } from "date-fns";
import type { AvailabilityWindow } from "@/lib/doctor-schedule-types";

export const WEEKDAY_LABELS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

/** Default IANA zone for demo seeds and add-window form initial value. */
export const DEFAULT_DOCTOR_TIMEZONE = "Europe/Berlin";

export function minsToTime(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function timeToMins(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
}

export function resolveBrowserTimezone(): string {
  if (typeof Intl === "undefined") return DEFAULT_DOCTOR_TIMEZONE;
  return Intl.DateTimeFormat().resolvedOptions().timeZone || DEFAULT_DOCTOR_TIMEZONE;
}

/** True when every window uses the same IANA zone — hide per-row TZ noise. */
export function availabilityUsesSingleTimezone(windows: AvailabilityWindow[]): boolean {
  if (windows.length === 0) return true;
  const first = windows[0]?.timezone;
  return windows.every((w) => w.timezone === first);
}

export function sharedAvailabilityTimezone(windows: AvailabilityWindow[]): string | null {
  if (!availabilityUsesSingleTimezone(windows)) return null;
  return windows[0]?.timezone ?? null;
}

export type WeekdayAvailabilityGroup = {
  weekday: number;
  label: string;
  windows: AvailabilityWindow[];
};

/** `/services` card row — weekdays sharing hours merge; one day with split hours stays on one row. */
export type ServicesAvailabilityDisplayRow = {
  weekdays: number[];
  ranges: { start_min: number; end_min: number }[];
};

type AvailabilitySlotLike = Pick<AvailabilityWindow, "weekday" | "start_min" | "end_min">;

/**
 * Services doctor cards:
 * 1. Identical start/end → one row, multiple weekday badges + single time.
 * 2. Same weekday, different hours → one row, one day badge + separate inline time spans.
 */
export function buildServicesAvailabilityDisplayRows(
  slots: AvailabilitySlotLike[]
): ServicesAvailabilityDisplayRow[] {
  const byTime = new Map<string, { start_min: number; end_min: number; days: number[] }>();

  for (const slot of slots) {
    const key = `${slot.start_min}-${slot.end_min}`;
    const existing = byTime.get(key);
    if (existing) {
      if (!existing.days.includes(slot.weekday)) {
        existing.days.push(slot.weekday);
      }
    } else {
      byTime.set(key, {
        start_min: slot.start_min,
        end_min: slot.end_min,
        days: [slot.weekday],
      });
    }
  }

  const multiDayRows: ServicesAvailabilityDisplayRow[] = [];
  const singleDayByWeekday = new Map<number, { start_min: number; end_min: number }[]>();

  for (const group of byTime.values()) {
    const days = [...group.days].sort((a, b) => a - b);
    if (days.length >= 2) {
      multiDayRows.push({
        weekdays: days,
        ranges: [{ start_min: group.start_min, end_min: group.end_min }],
      });
      continue;
    }
    const weekday = days[0];
    if (weekday == null) continue;
    const list = singleDayByWeekday.get(weekday) ?? [];
    list.push({ start_min: group.start_min, end_min: group.end_min });
    singleDayByWeekday.set(weekday, list);
  }

  const singleDayRows: ServicesAvailabilityDisplayRow[] = [...singleDayByWeekday.entries()]
    .sort(([a], [b]) => a - b)
    .map(([weekday, ranges]) => ({
      weekdays: [weekday],
      ranges: [...ranges].sort((a, b) => a.start_min - b.start_min),
    }));

  return [...multiDayRows, ...singleDayRows].sort(
    (a, b) => Math.min(...a.weekdays) - Math.min(...b.weekdays)
  );
}

/** Portal/CP list: one section per weekday, multiple windows per day sorted by start. */
/** Collapsed weekday `<summary>` hint — window count + time ranges. */
/** Unavailable-dates collapsed summary — full range on one responsive line. */
export function formatTimeOffRangeLabel(startsAt: string, endsAt: string): string {
  return `${format(new Date(startsAt), "MMM d, yyyy HH:mm")} – ${format(new Date(endsAt), "MMM d, yyyy HH:mm")}`;
}

export function formatWeekdayWindowsHint(windows: AvailabilityWindow[]): string {
  if (windows.length === 0) return "No time windows";
  const ranges = windows.map((w) => `${minsToTime(w.start_min)}–${minsToTime(w.end_min)}`);
  const n = windows.length;
  return `${n} window${n === 1 ? "" : "s"} · ${ranges.join(", ")}`;
}

/** Services cards — comma-separated ranges for one weekday row (sorted by start). */
export function formatWeekdayTimeRangesInline(windows: AvailabilityWindow[]): string {
  return [...windows]
    .sort((a, b) => a.start_min - b.start_min)
    .map((w) => `${minsToTime(w.start_min)} – ${minsToTime(w.end_min)}`)
    .join(", ");
}

export function groupAvailabilityByWeekday(windows: AvailabilityWindow[]): WeekdayAvailabilityGroup[] {
  const byDay = new Map<number, AvailabilityWindow[]>();
  for (const w of windows) {
    const list = byDay.get(w.weekday) ?? [];
    list.push(w);
    byDay.set(w.weekday, list);
  }
  return Array.from(byDay.entries())
    .sort(([a], [b]) => a - b)
    .map(([weekday, dayWindows]) => ({
      weekday,
      label: WEEKDAY_LABELS[weekday] ?? `Day ${weekday}`,
      windows: [...dayWindows].sort((a, b) => a.start_min - b.start_min),
    }));
}
