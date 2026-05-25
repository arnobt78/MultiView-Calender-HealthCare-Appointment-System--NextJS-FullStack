"use client";

import { Calendar, CalendarCheck, CalendarClock, Clock } from "lucide-react";
import { PatientStatCard } from "@/components/control-panel/PatientStatCard";
import type { DoctorPortalData } from "@/types/types";

type DoctorPortalStatsRowProps = {
  metrics: DoctorPortalData["metrics"] | undefined;
  /** Pulse numeric slots only — card chrome + labels stay static. */
  valueSkeleton: boolean;
};

/** Appointment metric strip under doctor portal chrome — reuses CP `PatientStatCard` glass tiles. */
export function DoctorPortalStatsRow({ metrics, valueSkeleton }: DoctorPortalStatsRowProps) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
      <PatientStatCard
        variant="sky"
        icon={Calendar}
        title="Today"
        subtitle="Appointments scheduled today"
        value={metrics?.today ?? 0}
        valueSkeleton={valueSkeleton}
      />
      <PatientStatCard
        variant="violet"
        icon={CalendarClock}
        title="This Week"
        subtitle="Mon–Sun window"
        value={metrics?.thisWeek ?? 0}
        valueSkeleton={valueSkeleton}
      />
      <PatientStatCard
        variant="emerald"
        icon={CalendarCheck}
        title="This Month"
        subtitle="Calendar month total"
        value={metrics?.thisMonth ?? 0}
        valueSkeleton={valueSkeleton}
      />
      <PatientStatCard
        variant="amber"
        icon={Clock}
        title="Pending"
        subtitle="Awaiting completion"
        value={metrics?.pending ?? 0}
        valueSkeleton={valueSkeleton}
      />
    </div>
  );
}
