import { format } from "date-fns";

/** Shared date/time copy for dashboard overview queue rows. */
export function formatDashboardAppointmentDateTimeRange(startIso: string, endIso: string): string {
  const start = new Date(startIso);
  const end = new Date(endIso);
  const sameDay = format(start, "yyyy-MM-dd") === format(end, "yyyy-MM-dd");
  if (sameDay) {
    return `${format(start, "EEE, dd MMM yyyy · HH:mm")} — ${format(end, "HH:mm")}`;
  }
  return `${format(start, "EEE, dd MMM yyyy · HH:mm")} — ${format(end, "EEE, dd MMM · HH:mm")}`;
}

/** Create/updated activity stamp on recent-activity queue rows. */
export function formatDashboardAppointmentActivityAt(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return format(d, "EEE, dd MMM yyyy · HH:mm");
}

export function formatDashboardAppointmentShortRange(startIso: string, endIso: string): string {
  const start = new Date(startIso);
  const end = new Date(endIso);
  const sameDay = format(start, "yyyy-MM-dd") === format(end, "yyyy-MM-dd");
  if (sameDay) {
    return `${format(start, "dd MMM · HH:mm")} — ${format(end, "HH:mm")}`;
  }
  return `${format(start, "dd MMM HH:mm")} — ${format(end, "dd MMM HH:mm")}`;
}
