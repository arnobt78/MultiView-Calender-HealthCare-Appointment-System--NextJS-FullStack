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
import type { InsightsPeriod } from "@/lib/insights/insights-period";
import {
  formatInsightsCalendarMonthHint,
  formatInsightsCalendarTodayHint,
  formatInsightsCalendarWeekHint,
  formatInsightsCalendarYearToDateHint,
  formatInsightsPeriodStatValueLabel,
} from "@/lib/insights/insights-period-label";
import { analyticsOverviewGridClass } from "@/lib/insights-ui-classes";

type Props = {
  data: InsightsPayload | undefined;
  valueSkeleton: boolean;
  /** View-as period — drives Pending/Revenue/Avg duration/Telehealth value-row hint. */
  period: InsightsPeriod;
};

/** Doctor-portal-style KPI strip for /insights — values pulse only on refetch. */
export function AnalyticsOverviewStatsRow({ data, valueSkeleton, period }: Props) {
  const periodValueHint = formatInsightsPeriodStatValueLabel(period);
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
        valueRowHint={formatInsightsCalendarTodayHint()}
      />
      <PatientStatCard
        variant="violet"
        icon={CalendarClock}
        title="This week"
        subtitle="Mon–Sun window"
        value={totals?.thisWeek ?? 0}
        valueSkeleton={valueSkeleton}
        valueRowHint={formatInsightsCalendarWeekHint()}
      />
      <PatientStatCard
        variant="emerald"
        icon={CalendarCheck}
        title="This month"
        subtitle="Calendar month total"
        value={totals?.thisMonth ?? data?.overview.thisMonth ?? 0}
        valueSkeleton={valueSkeleton}
        valueRowHint={formatInsightsCalendarMonthHint()}
      />
      <PatientStatCard
        variant="violet"
        icon={Activity}
        title="Year to date"
        subtitle="Calendar year total (incl. scheduled future)"
        value={totals?.yearToDate ?? data?.overview.total ?? 0}
        valueSkeleton={valueSkeleton}
        valueRowHint={formatInsightsCalendarYearToDateHint()}
      />
      <PatientStatCard
        variant="amber"
        icon={Clock}
        title="Pending"
        subtitle="Awaiting completion"
        value={totals?.pending ?? data?.overview.pending ?? 0}
        valueSkeleton={valueSkeleton}
        valueRowHint={periodValueHint}
      />
      <PatientStatCard
        variant="emerald"
        icon={BadgeDollarSign}
        title="Revenue"
        subtitle="Paid in selected period ($)"
        value={0}
        valueDisplay={formatInsightsUsdFromCents(paidCents)}
        valueSkeleton={valueSkeleton}
        valueRowHint={periodValueHint}
      />
      <PatientStatCard
        variant="sky"
        icon={Clock}
        title="Avg duration"
        subtitle="Minutes per visit in selected period"
        value={totals?.avgDurationMinutes ?? data?.overview.avgDurationMinutes ?? 0}
        valueSkeleton={valueSkeleton}
        valueRowHint={periodValueHint}
      />
      <PatientStatCard
        variant="violet"
        icon={Video}
        title="Telehealth"
        subtitle="Share of visits in selected period (%)"
        value={0}
        valueDisplay={formatInsightsPercent(telehealthPct)}
        valueSkeleton={valueSkeleton}
        valueRowHint={periodValueHint}
      />
    </div>
  );
}
