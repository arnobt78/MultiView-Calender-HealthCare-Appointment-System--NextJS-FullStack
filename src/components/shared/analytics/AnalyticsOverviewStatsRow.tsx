"use client";

import {
  Activity,
  BadgeDollarSign,
  Calendar,
  CalendarCheck,
  CalendarClock,
  Clock,
  Video,
} from "lucide-react";
import { PatientStatCard } from "@/components/control-panel/PatientStatCard";
import type { InsightsPayload } from "@/lib/insights-data";
import { analyticsOverviewGridClass } from "@/lib/insights-ui-classes";

type Props = {
  data: InsightsPayload | undefined;
  valueSkeleton: boolean;
};

/** Doctor-portal-style KPI strip for /insights — values pulse only on refetch. */
export function AnalyticsOverviewStatsRow({ data, valueSkeleton }: Props) {
  const totals = data?.v2?.appointments.totals;
  const revenue = data?.v2?.revenue;

  return (
    <div className={analyticsOverviewGridClass}>
      <PatientStatCard
        variant="sky"
        icon={Calendar}
        title="Today"
        subtitle="Appointments scheduled today"
        value={totals?.today ?? data?.overview.thisMonth ?? 0}
        valueSkeleton={valueSkeleton}
      />
      <PatientStatCard
        variant="violet"
        icon={CalendarClock}
        title="This week"
        subtitle="Mon–Sun window"
        value={totals?.thisWeek ?? 0}
        valueSkeleton={valueSkeleton}
      />
      <PatientStatCard
        variant="emerald"
        icon={CalendarCheck}
        title="This month"
        subtitle="Calendar month total"
        value={totals?.thisMonth ?? data?.overview.thisMonth ?? 0}
        valueSkeleton={valueSkeleton}
      />
      <PatientStatCard
        variant="violet"
        icon={Activity}
        title="Year to date"
        subtitle="Jan 1 through today"
        value={totals?.yearToDate ?? data?.overview.total ?? 0}
        valueSkeleton={valueSkeleton}
      />
      <PatientStatCard
        variant="amber"
        icon={Clock}
        title="Pending"
        subtitle="Awaiting completion"
        value={totals?.pending ?? data?.overview.pending ?? 0}
        valueSkeleton={valueSkeleton}
      />
      <PatientStatCard
        variant="emerald"
        icon={BadgeDollarSign}
        title="Revenue"
        subtitle="Paid in selected period"
        value={Math.round((revenue?.paidInPeriod ?? data?.revenueThisMonth ?? 0) / 100)}
        valueSkeleton={valueSkeleton}
      />
      <PatientStatCard
        variant="sky"
        icon={Clock}
        title="Avg duration"
        subtitle="Minutes per visit"
        value={totals?.avgDurationMinutes ?? data?.overview.avgDurationMinutes ?? 0}
        valueSkeleton={valueSkeleton}
      />
      <PatientStatCard
        variant="violet"
        icon={Video}
        title="Telehealth"
        subtitle="Share of all visits"
        value={totals?.telehealthPct ?? 0}
        valueSkeleton={valueSkeleton}
      />
    </div>
  );
}
