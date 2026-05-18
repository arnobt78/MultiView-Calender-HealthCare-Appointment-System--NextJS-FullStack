/**
 * Calendar day-relative labels (Today / Tomorrow / Later / Passed).
 * Shared by list, day/week/month grid, hover cards, and month side panel.
 */

export type AppointmentDateTagKind =
  | "today"
  | "tomorrow"
  | "later"
  | "passed"
  | null;

/**
 * Real-world "today" for Passed / Today / Tomorrow / Later badges.
 * Do not use `DateContext.currentDate` (month/week navigation anchor).
 */
export function getCalendarTagReferenceDate(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

/** Whole-day diff: appointment date vs reference (defaults to calendar today). */
export function getAppointmentDayDiff(
  appointmentDate: Date,
  referenceDate: Date = getCalendarTagReferenceDate()
): number {
  const ref = new Date(referenceDate);
  ref.setHours(0, 0, 0, 0);
  const d = new Date(appointmentDate);
  d.setHours(0, 0, 0, 0);
  return Math.floor((d.getTime() - ref.getTime()) / (1000 * 60 * 60 * 24));
}

export function getAppointmentDateTagKind(
  appointmentDate: Date,
  referenceDate?: Date
): AppointmentDateTagKind {
  const diff = getAppointmentDayDiff(appointmentDate, referenceDate);
  if (diff === 0) return "today";
  if (diff === 1) return "tomorrow";
  if (diff > 1) return "later";
  if (diff < 0) return "passed";
  return null;
}

/** Glass badge class per tag kind (matches calendar-glass-badge tokens). */
export function appointmentDateTagBadgeClass(
  kind: NonNullable<AppointmentDateTagKind>
): string {
  switch (kind) {
    case "today":
      return "calendar-glass-badge calendar-glass-badge-emerald";
    case "tomorrow":
      return "calendar-glass-badge calendar-glass-badge-blue";
    case "later":
      return "calendar-glass-badge calendar-glass-badge-violet";
    case "passed":
      return "calendar-glass-badge calendar-glass-badge-slate";
    default:
      return "calendar-glass-badge";
  }
}

export function appointmentDateTagLabel(
  kind: NonNullable<AppointmentDateTagKind>
): string {
  switch (kind) {
    case "today":
      return "Today";
    case "tomorrow":
      return "Tomorrow";
    case "later":
      return "Later";
    case "passed":
      return "Passed";
    default:
      return "";
  }
}
