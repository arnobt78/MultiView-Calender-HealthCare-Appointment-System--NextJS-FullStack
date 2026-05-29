/**
 * Dashboard overview queue — relative start-time tone (today / 24h / 48h / later).
 */

import { isSameDay } from "date-fns";

export type DashboardAppointmentRelativeTone = "today" | "within24h" | "within48h" | "later";

const MS_PER_HOUR = 60 * 60 * 1000;

/** Relative “in about …” label beside clock icon. */
export const dashboardAppointmentRelativeTimeClass: Record<
  DashboardAppointmentRelativeTone,
  string
> = {
  today: "text-emerald-600 font-medium",
  within24h: "text-sky-600 font-medium",
  within48h: "text-amber-600 font-medium",
  later: "text-muted-foreground",
};

/** Lucide icon tint for relative-time row. */
export const dashboardAppointmentRelativeIconClass: Record<
  DashboardAppointmentRelativeTone,
  string
> = {
  today: "text-emerald-600/85",
  within24h: "text-sky-600/85",
  within48h: "text-amber-600/85",
  later: "text-muted-foreground/80",
};

/** Schedule datetime row when appointment start is on the viewer’s calendar today. */
export const dashboardAppointmentTodayScheduleMetaClass =
  "[&_svg]:text-emerald-600/85 [&_span]:font-medium [&_span]:text-emerald-700";

/**
 * Tone from appointment start vs now:
 * - same calendar day → today (emerald)
 * - else ≤24h → sky
 * - else ≤48h → amber
 * - else muted
 */
export function resolveDashboardAppointmentRelativeTone(
  startIso: string,
  now: Date = new Date()
): DashboardAppointmentRelativeTone {
  const start = new Date(startIso);
  if (Number.isNaN(start.getTime())) return "later";

  if (isSameDay(start, now)) return "today";

  const hoursUntil = (start.getTime() - now.getTime()) / MS_PER_HOUR;
  if (hoursUntil <= 0) return "later";
  if (hoursUntil <= 24) return "within24h";
  if (hoursUntil <= 48) return "within48h";
  return "later";
}
