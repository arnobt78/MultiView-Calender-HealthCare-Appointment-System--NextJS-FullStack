"use client";

import { Activity, UserMinus, Users, UserCheck } from "lucide-react";
import { PatientStatCard } from "@/components/control-panel/PatientStatCard";
import { usePatientMetricsContext } from "@/context/PatientMetricsContext";

/** Stat strip under the page title — reads shared metrics context (invalidates with `queryKeys.patients.all`). */
export function PatientManagementStatsRow() {
  const { metrics, isLoading } = usePatientMetricsContext();
  const skeleton = isLoading;
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <PatientStatCard
        variant="violet"
        icon={Users}
        title="Total patients"
        subtitle="All records in this workspace"
        value={metrics.total}
        valueSkeleton={skeleton}
      />
      <PatientStatCard
        variant="emerald"
        icon={UserCheck}
        title="Active"
        subtitle="Currently marked active"
        value={metrics.active}
        valueSkeleton={skeleton}
      />
      <PatientStatCard
        variant="sky"
        icon={UserMinus}
        title="Inactive"
        subtitle="Archived or paused access"
        value={metrics.inactive}
        valueSkeleton={skeleton}
      />
      <PatientStatCard
        variant="amber"
        icon={Activity}
        title="Acuity on file"
        subtitle="Patients with a 1–10 tier saved"
        badge={metrics.highAcuity > 0 ? `${metrics.highAcuity} at tier 7+` : undefined}
        value={metrics.withCareTier}
        valueSkeleton={skeleton}
      />
    </div>
  );
}
