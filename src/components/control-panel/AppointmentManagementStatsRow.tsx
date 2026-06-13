"use client";

import { AlertTriangle, CalendarDays, CheckCircle2, Clock, XCircle } from "lucide-react";
import { PatientStatCard } from "@/components/control-panel/PatientStatCard";
import { useAppointmentMetricsContext } from "@/context/AppointmentMetricsContext";

/** Display-only KPI strip — filters live in `ClinicalListFilterToolbar`. */
export function AppointmentManagementStatsRow() {
  const { metrics, listBodyLoading, isFetching } = useAppointmentMetricsContext();
  const skeleton = listBodyLoading || isFetching;

  return (
    <div className="grid grid-cols-1 gap-2 overflow-visible sm:grid-cols-2 lg:grid-cols-5">
      <PatientStatCard
        variant="violet"
        icon={CalendarDays}
        title="Total Appointments"
        subtitle="All Records In This Workspace"
        value={metrics.total}
        valueSkeleton={skeleton}
      />
      <PatientStatCard
        variant="emerald"
        icon={CheckCircle2}
        title="Done"
        subtitle="Completed Visits"
        value={metrics.done}
        valueSkeleton={skeleton}
      />
      <PatientStatCard
        variant="sky"
        icon={Clock}
        title="Open"
        subtitle="Pending Or In Progress"
        value={metrics.open}
        valueSkeleton={skeleton}
      />
      <PatientStatCard
        variant="amber"
        icon={AlertTriangle}
        title="Alert"
        subtitle="Needs Attention"
        value={metrics.alert}
        valueSkeleton={skeleton}
      />
      <PatientStatCard
        variant="rose"
        icon={XCircle}
        title="Cancelled"
        subtitle="Cancelled Visits"
        value={metrics.cancelled}
        valueSkeleton={skeleton}
      />
    </div>
  );
}
