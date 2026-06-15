"use client";

import { CalendarClock, MapPin } from "lucide-react";
import { TelehealthSessionBadge } from "@/components/shared/appointments/TelehealthSessionBadge";
import { DashboardMetaIconRow } from "@/components/control-panel/dashboard/DashboardMetaIconRow";
import {
  formatDashboardAppointmentDateTimeRange,
  formatDashboardAppointmentShortRange,
} from "@/components/control-panel/dashboard/dashboard-appointment-datetime";
import type { DashboardAppointmentRelativeTone } from "@/lib/dashboard-appointment-relative-time";
import { dashboardAppointmentTodayScheduleMetaClass } from "@/lib/dashboard-appointment-relative-time";
import { controlPanelDashboardScheduleMetaRowClass } from "@/lib/control-panel-glass-card";
import { cn } from "@/lib/utils";

type Props = {
  start: string;
  end: string;
  location: string | null;
  isTelehealth?: boolean;
  /** `full` for next appointment; `short` for recent list rows. */
  dateVariant?: "full" | "short";
  /** When `today`, datetime line uses emerald (upcoming queue). */
  relativeTone?: DashboardAppointmentRelativeTone;
  /** Default true — telehealth queue passes false to avoid duplicate badges. */
  showTelehealthBadge?: boolean;
  className?: string;
};

/** Datetime + location + telehealth on one responsive wrap row (overview queue cards). */
export function DashboardAppointmentScheduleMetaRow({
  start,
  end,
  location,
  isTelehealth = false,
  dateVariant = "full",
  relativeTone,
  showTelehealthBadge = true,
  className,
}: Props) {
  const dateLabel =
    dateVariant === "short"
      ? formatDashboardAppointmentShortRange(start, end)
      : formatDashboardAppointmentDateTimeRange(start, end);
  const place = location?.trim();
  const todayScheduleClass =
    relativeTone === "today" ? dashboardAppointmentTodayScheduleMetaClass : undefined;

  return (
    <div className={cn(controlPanelDashboardScheduleMetaRowClass, className)}>
      <DashboardMetaIconRow
        icon={CalendarClock}
        className={cn("max-w-full [&_span]:whitespace-normal", todayScheduleClass)}
      >
        {dateLabel}
      </DashboardMetaIconRow>
      {place ? (
        <DashboardMetaIconRow icon={MapPin} className="max-w-full [&_span]:truncate">
          {place}
        </DashboardMetaIconRow>
      ) : null}
      {isTelehealth && showTelehealthBadge ? <TelehealthSessionBadge /> : null}
    </div>
  );
}
