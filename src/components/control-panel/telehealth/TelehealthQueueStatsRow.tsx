"use client";

import { CalendarClock, Layers, Radio, Video } from "lucide-react";
import { PatientStatCard } from "@/components/control-panel/PatientStatCard";
import {
  filterTelehealthAppointmentsOnly,
  filterTelehealthQueueAppointments,
  isTelehealthSessionInProgress,
} from "@/lib/telehealth-queue-filter";
import { telehealthQueueStatsGridClass } from "@/lib/telehealth-queue-ui-classes";
import type { FullAppointment } from "@/hooks/useAppointments";
import { isToday, isFuture } from "date-fns";

type Props = {
  appointments: FullAppointment[] | null | undefined;
  listBodyLoading: boolean;
};

/** KPI strip — telehealth-only counts. */
export function TelehealthQueueStatsRow({ appointments, listBodyLoading }: Props) {
  const telehealth = filterTelehealthAppointmentsOnly(appointments);
  const todayCount = filterTelehealthQueueAppointments(appointments, "today").length;
  const upcomingCount = telehealth.filter((a) => isFuture(new Date(a.start)) && !isToday(new Date(a.start))).length;
  const liveCount = telehealth.filter((a) => isTelehealthSessionInProgress(a)).length;
  const totalCount = telehealth.length;

  return (
    <div className={telehealthQueueStatsGridClass}>
      <PatientStatCard
        variant="violet"
        icon={Video}
        title="Today"
        subtitle="Telehealth sessions"
        value={todayCount}
        valueSkeleton={listBodyLoading}
      />
      <PatientStatCard
        variant="sky"
        icon={CalendarClock}
        title="Upcoming"
        subtitle="Future video visits"
        value={upcomingCount}
        valueSkeleton={listBodyLoading}
      />
      <PatientStatCard
        variant="emerald"
        icon={Radio}
        title="Live now"
        subtitle="In-progress sessions"
        value={liveCount}
        valueSkeleton={listBodyLoading}
      />
      <PatientStatCard
        variant="rose"
        icon={Layers}
        title="Total all time"
        subtitle="All telehealth visits"
        value={totalCount}
        valueSkeleton={listBodyLoading}
      />
    </div>
  );
}
