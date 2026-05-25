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
