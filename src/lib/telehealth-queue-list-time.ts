/**
 * Telehealth schedule list — left time column tone (reuses dashboard relative windows).
 */

import type { DashboardAppointmentRelativeTone } from "@/lib/dashboard-appointment-relative-time";

/** Large clock digits in the list row gutter. */
export const telehealthQueueListTimePrimaryClass: Record<
  DashboardAppointmentRelativeTone,
  string
> = {
  today: "text-emerald-700",
  within24h: "text-sky-700",
  within48h: "text-amber-700",
  later: "text-violet-700/85",
};

/** AM/PM and date lines beneath the clock. */
export const telehealthQueueListTimeSecondaryClass: Record<
  DashboardAppointmentRelativeTone,
  string
> = {
  today: "text-emerald-600/90",
  within24h: "text-sky-600/90",
  within48h: "text-amber-600/90",
  later: "text-violet-600/75",
};

export const telehealthQueueListTimeInProgressPrimaryClass = "text-violet-800";
export const telehealthQueueListTimeInProgressSecondaryClass = "text-violet-600/85";
export const telehealthQueueListTimeEndedClass = "text-muted-foreground/65";
