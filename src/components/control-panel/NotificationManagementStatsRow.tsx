"use client";

import { Banknote, Bell, BellOff, CheckCheck, Inbox } from "lucide-react";
import { PatientStatCard } from "@/components/control-panel/PatientStatCard";
import { useNotificationMetricsContext } from "@/context/NotificationMetricsContext";

/** Display-only KPI strip — filters live in `ClinicalListFilterToolbar`. */
export function NotificationManagementStatsRow() {
  const { metrics, listBodyLoading, isFetching } = useNotificationMetricsContext();
  const skeleton = listBodyLoading || isFetching;

  return (
    <div className="grid grid-cols-1 gap-2 overflow-visible sm:grid-cols-2 lg:grid-cols-5">
      <PatientStatCard
        variant="rose"
        icon={Inbox}
        title="Total"
        subtitle="Notifications In Inbox"
        value={metrics.total}
        valueSkeleton={skeleton}
      />
      <PatientStatCard
        variant="sky"
        icon={Bell}
        title="Unread"
        subtitle="Needs Your Attention"
        value={metrics.unread}
        valueSkeleton={skeleton}
      />
      <PatientStatCard
        variant="emerald"
        icon={CheckCheck}
        title="Read"
        subtitle="Already Reviewed"
        value={metrics.read}
        valueSkeleton={skeleton}
      />
      <PatientStatCard
        variant="violet"
        icon={Banknote}
        title="Billing"
        subtitle="Invoice & Payment Alerts"
        value={metrics.billing}
        valueSkeleton={skeleton}
      />
      <PatientStatCard
        variant="amber"
        icon={BellOff}
        title="Recent"
        subtitle="Received Last 24 Hours"
        value={metrics.last24h}
        valueSkeleton={skeleton}
      />
    </div>
  );
}
