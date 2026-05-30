"use client";

import { Activity, UserMinus, Users, UserCheck } from "lucide-react";
import { PatientStatCard } from "@/components/control-panel/PatientStatCard";
import { usePatientMetricsContext } from "@/context/PatientMetricsContext";

/** Stat strip under the page title — reads shared metrics context (invalidates with `queryKeys.patients.all`). */
export function PatientManagementStatsRow() {
  const { metrics, listBodyLoading, isFetching } = usePatientMetricsContext();
  const skeleton = listBodyLoading || isFetching;
  return (
    <div className="grid grid-cols-1 gap-2 overflow-visible sm:grid-cols-2 lg:grid-cols-4">
      <PatientStatCard
        variant="violet"
        icon={Users}
        title="Total Patients"
        subtitle="All Records In This Workspace"
        value={metrics.total}
        valueSkeleton={skeleton}
      />
      <PatientStatCard
        variant="emerald"
        icon={UserCheck}
        title="Active"
        subtitle="Currently Marked Active"
        value={metrics.active}
        valueSkeleton={skeleton}
      />
      <PatientStatCard
        variant="sky"
        icon={UserMinus}
        title="Inactive"
        subtitle="Archived Or Paused Access"
        value={metrics.inactive}
        valueSkeleton={skeleton}
      />
      <PatientStatCard
        variant="amber"
        icon={Activity}
        title="Acuity On File"
        subtitle="Patients With A 1–10 Tier Saved"
        badge={metrics.highAcuity > 0 ? `${metrics.highAcuity} At Tier 7+` : undefined}
        value={metrics.withCareTier}
        valueSkeleton={skeleton}
      />
    </div>
  );
}
