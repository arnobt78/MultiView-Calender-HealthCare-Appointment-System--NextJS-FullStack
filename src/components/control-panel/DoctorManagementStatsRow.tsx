"use client";

import { CalendarClock, Stethoscope, UserCheck, UserMinus, Users } from "lucide-react";
import { PatientStatCard } from "@/components/control-panel/PatientStatCard";
import { useDoctorMetricsContext } from "@/context/DoctorMetricsContext";

/** Stat strip under doctor-management header — reads shared metrics context. */
export function DoctorManagementStatsRow() {
  const { metrics, listBodyLoading, isFetching } = useDoctorMetricsContext();
  const skeleton = listBodyLoading || isFetching;
  return (
    <div className="grid grid-cols-1 gap-2 overflow-visible sm:grid-cols-2 lg:grid-cols-4">
      <PatientStatCard
        variant="emerald"
        icon={Users}
        title="Total Doctors"
        subtitle="Seeded Roster In This Workspace"
        value={metrics.total}
        valueSkeleton={skeleton}
      />
      <PatientStatCard
        variant="sky"
        icon={UserCheck}
        title="Active"
        subtitle="Available For New Bookings"
        value={metrics.active}
        valueSkeleton={skeleton}
      />
      <PatientStatCard
        variant="violet"
        icon={UserMinus}
        title="Inactive"
        subtitle="Hidden From New Booking Selects"
        value={metrics.inactive}
        valueSkeleton={skeleton}
      />
      <PatientStatCard
        variant="amber"
        icon={CalendarClock}
        title="With Availability"
        subtitle="Weekly Hours Configured"
        value={metrics.withAvailability}
        valueSkeleton={skeleton}
      />
    </div>
  );
}
