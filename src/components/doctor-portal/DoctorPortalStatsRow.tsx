"use client";

import { useMemo } from "react";
import { Calendar, CalendarCheck, CalendarClock, Clock } from "lucide-react";
import { PatientStatCard } from "@/components/control-panel/PatientStatCard";
import {
  doctorPortalAllTimeStatusHintLabel,
  doctorPortalMonthPeriodBadgeLabel,
  doctorPortalTodayStatusBadgeLabel,
  doctorPortalWeekPeriodBadgeLabel,
} from "@/lib/doctor-portal-stat-badges";
import { summarizeDayAppointments } from "@/lib/appointment-stats";
import type { Appointment } from "@/types/types";
import type { DoctorPortalData } from "@/types/types";

type DoctorPortalStatsRowProps = {
  metrics: DoctorPortalData["metrics"] | undefined;
  todayAppointments?: Appointment[];
  valueSkeleton: boolean;
};

/** Doctor portal KPI strip — insights-style value row (hint left, count right). */
export function DoctorPortalStatsRow({
  metrics,
  todayAppointments = [],
  valueSkeleton,
}: DoctorPortalStatsRowProps) {
  const todayStatus = useMemo(
    () => summarizeDayAppointments(todayAppointments),
    [todayAppointments]
  );

  const todayHint = valueSkeleton
    ? undefined
    : doctorPortalTodayStatusBadgeLabel(todayStatus);

  const weekHint =
    !valueSkeleton && metrics != null
      ? doctorPortalWeekPeriodBadgeLabel(metrics.weekPassed ?? 0)
      : undefined;

  const monthHint =
    !valueSkeleton && metrics != null
      ? doctorPortalMonthPeriodBadgeLabel(metrics.monthPassed ?? 0)
      : undefined;

  const pendingHint =
    !valueSkeleton && metrics != null
      ? doctorPortalAllTimeStatusHintLabel({
          alert: metrics.alert ?? 0,
          done: metrics.done ?? 0,
          cancelled: metrics.cancelled ?? 0,
        })
      : undefined;

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
      <PatientStatCard
        variant="sky"
        icon={Calendar}
        title="Today"
        subtitle="Appointments scheduled today"
        value={metrics?.today ?? 0}
        valueSkeleton={valueSkeleton}
        valueRowHint={todayHint}
      />
      <PatientStatCard
        variant="violet"
        icon={CalendarClock}
        title="This Week"
        subtitle="Mon–Sun window"
        value={metrics?.thisWeek ?? 0}
        valueSkeleton={valueSkeleton}
        valueRowHint={weekHint}
      />
      <PatientStatCard
        variant="emerald"
        icon={CalendarCheck}
        title="This Month"
        subtitle="Calendar month total"
        value={metrics?.thisMonth ?? 0}
        valueSkeleton={valueSkeleton}
        valueRowHint={monthHint}
      />
      <PatientStatCard
        variant="amber"
        icon={Clock}
        title="Pending"
        subtitle="Awaiting completion (all-time)"
        value={metrics?.pending ?? 0}
        valueSkeleton={valueSkeleton}
        valueRowHint={pendingHint}
      />
    </div>
  );
}
