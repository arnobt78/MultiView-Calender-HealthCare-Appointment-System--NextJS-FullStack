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
import { formatInsightsPercent, formatInsightsUsdFromCents } from "@/lib/insights/insights-kpi-format";
import { analyticsOverviewGridClass } from "@/lib/insights-ui-classes";

type Props = {
  data: InsightsPayload | undefined;
  valueSkeleton: boolean;
};

/** Doctor-portal-style KPI strip for /insights — values pulse only on refetch. */
export function AnalyticsOverviewStatsRow({ data, valueSkeleton }: Props) {
  const totals = data?.v2?.appointments.totals;
  const revenue = data?.v2?.revenue;
  const paidCents = revenue?.paidInPeriod ?? data?.revenueThisMonth ?? 0;
  const telehealthPct = totals?.telehealthPct ?? 0;

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
        subtitle="Calendar year total (incl. scheduled future)"
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
        subtitle="Paid in selected period ($)"
        value={0}
        valueDisplay={formatInsightsUsdFromCents(paidCents)}
        valueSkeleton={valueSkeleton}
      />
      <PatientStatCard
        variant="sky"
        icon={Clock}
        title="Avg duration"
        subtitle="Minutes per visit in selected period"
        value={totals?.avgDurationMinutes ?? data?.overview.avgDurationMinutes ?? 0}
        valueSkeleton={valueSkeleton}
      />
      <PatientStatCard
        variant="violet"
        icon={Video}
        title="Telehealth"
        subtitle="Share of all visits (%)"
        value={0}
        valueDisplay={formatInsightsPercent(telehealthPct)}
        valueSkeleton={valueSkeleton}
      />
    </div>
  );
}
