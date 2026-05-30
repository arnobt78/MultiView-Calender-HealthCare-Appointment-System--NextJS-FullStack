"use client";

import { CheckCircle2, Clock, Layers, Tag } from "lucide-react";
import { PatientStatCard } from "@/components/control-panel/PatientStatCard";
import { useCategoryMetricsContext } from "@/context/CategoryMetricsContext";

/** KPI strip for category management — reads shared metrics context. */
export function CategoryManagementStatsRow() {
  const { metrics, listBodyLoading, isFetching } = useCategoryMetricsContext();
  const skeleton = listBodyLoading || isFetching;
  return (
    <div className="grid grid-cols-1 gap-2 overflow-visible sm:grid-cols-2 lg:grid-cols-4">
      <PatientStatCard
        variant="violet"
        icon={Tag}
        title="Total Categories"
        subtitle="All Service Types In Catalog"
        value={metrics.total}
        valueSkeleton={skeleton}
      />
      <PatientStatCard
        variant="emerald"
        icon={CheckCircle2}
        title="Active"
        subtitle="Available For New Appointments"
        value={metrics.active}
        valueSkeleton={skeleton}
      />
      <PatientStatCard
        variant="sky"
        icon={Clock}
        title="With Duration"
        subtitle="Default Slot Length Configured"
        value={metrics.withDuration}
        valueSkeleton={skeleton}
      />
      <PatientStatCard
        variant="amber"
        icon={Layers}
        title="Inactive"
        subtitle="Hidden From Booking Select"
        value={metrics.inactive}
        valueSkeleton={skeleton}
      />
    </div>
  );
}
