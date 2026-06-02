"use client";

import {
  BarChart3,
  BadgeDollarSign,
  CalendarDays,
  FolderTree,
  Layers,
  PieChart,
  Receipt,
  Stethoscope,
  UserRound,
  Users,
} from "lucide-react";
import { PortalPanelSection } from "@/components/shared/PortalPanelSection";
import { AnalyticsChartCard } from "@/components/shared/analytics/AnalyticsChartCard";
import { AnalyticsLineChart } from "@/components/shared/analytics/AnalyticsLineChart";
import { AnalyticsBarChart } from "@/components/shared/analytics/AnalyticsBarChart";
import { AnalyticsPieChart } from "@/components/shared/analytics/AnalyticsPieChart";
import { AnalyticsAreaChart } from "@/components/shared/analytics/AnalyticsAreaChart";
import { AnalyticsStackedBarChart } from "@/components/shared/analytics/AnalyticsStackedBarChart";
import { AnalyticsTopPatientsPanel } from "@/components/shared/analytics/AnalyticsTopPatientsPanel";
import { AnalyticsRevenueStatsRow } from "@/components/shared/analytics/AnalyticsRevenueStatsRow";
import { AnalyticsStatusSummaryRow } from "@/components/shared/analytics/AnalyticsStatusSummaryRow";
import { InsightsAppointmentsPanelHeader } from "@/components/insights/InsightsAppointmentsPanelHeader";
import type { InsightsPayload } from "@/lib/insights-data";
import { getInsightsChartContextSubtitle } from "@/lib/insights-chart-subtitle";
import { resolveInsightsScopeChartLabel } from "@/lib/insights-scope-display";
import { AnalyticsDoctorInsightsSection } from "@/components/shared/analytics/AnalyticsDoctorInsightsSection";
import type { InsightsQueryKey } from "@/lib/insights-scope";
import type { InsightsPeriod } from "@/lib/insights/insights-period";

import { formatBillingKpiMoney } from "@/lib/insights/insights-kpi-format";

type Props = {
  data: InsightsPayload | undefined;
  loading: boolean;
  viewerRole: string | null;
  insightsQuery: InsightsQueryKey;
  /** Admin doctor list — used for scope subtitle when drilling into a doctor. */
  doctorDisplayName?: string;
  period: InsightsPeriod;
  onPeriodChange: (next: InsightsPeriod) => void;
  periodControlsDisabled?: boolean;
};

/** Domain-grouped Recharts sections for /insights. */
export function AnalyticsInsightsSections({
  data,
  loading,
  viewerRole,
  insightsQuery,
  doctorDisplayName,
  period,
  onPeriodChange,
  periodControlsDisabled = false,
}: Props) {
  const v2 = data?.v2;
  const trend =
    v2?.appointments.trend?.map((p) => ({ label: p.label, count: p.count })) ??
    data?.monthlyData?.map((m) => ({ label: m.month, count: m.count })) ??
    [];
  const weekday =
    v2?.appointments.busiestDayOfWeek?.map((d) => ({ label: d.label, count: d.count })) ??
    data?.busiestDayOfWeek?.map((d) => ({ label: d.label, count: d.count })) ??
    [];
  const statusOverTime =
    v2?.appointments.statusOverTime ?? data?.statusOverTime ?? [];
  const categoryBars = Object.entries(v2?.appointments.byCategory ?? data?.byCategory ?? {})
    .sort(([, a], [, b]) => b - a)
    .map(([label, count]) => ({ label, count }));
  const typePie =
    v2?.appointments.typeBreakdown?.map((t) => ({ name: t.name, count: t.count })) ??
    data?.appointmentTypeBreakdown?.map((t) => ({ name: t.name, count: t.count })) ??
    [];
  const ageBars = v2?.patients.ageDistribution ?? data?.ageDistribution ?? [];
  const topPatients = v2?.patients.topPatients ?? data?.topPatients ?? [];
  const revenueTrend = v2?.revenue.revenueTrend ?? trend;
  const invoiceStatus = v2?.revenue.invoiceByStatus
    ? Object.entries(v2.revenue.invoiceByStatus).map(([label, count]) => ({ label, count }))
    : [];
  const doctorsSection = v2?.doctors ?? null;

  const scopeLabel = resolveInsightsScopeChartLabel({
    scope: insightsQuery.scope,
    viewerRole,
    doctorId: insightsQuery.doctorId,
    doctorDisplayName,
  });

  const chartSubtitle = getInsightsChartContextSubtitle({
    meta: v2?.meta,
    period,
    scopeLabel,
  });

  const byStatus = v2?.appointments.byStatus ?? data?.byStatus;
  const paidInPeriodCents = v2?.revenue.paidInPeriod ?? data?.revenueThisMonth ?? 0;
  const appointmentsAllTime =
    v2?.appointments.totals.all ?? data?.overview.total ?? 0;
  const upcomingScheduled = v2?.appointments.totals.upcoming ?? data?.overview.upcoming ?? 0;
  const untilToday = Math.max(0, appointmentsAllTime - upcomingScheduled);
  return (
    <div className="space-y-6">
      <PortalPanelSection
        title="Appointments"
        icon={BarChart3}
        clipContent={false}
        headerSlot={
          <InsightsAppointmentsPanelHeader
            overall={appointmentsAllTime}
            untilToday={untilToday}
            upcoming={upcomingScheduled}
            period={period}
            onPeriodChange={onPeriodChange}
            disabled={periodControlsDisabled}
            loading={loading}
            scopeLabel={scopeLabel}
          />
        }
      >
        <AnalyticsStatusSummaryRow
          byStatus={byStatus}
          periodLabel={chartSubtitle}
          loading={loading}
          className="mb-4"
        />
        <div className="grid gap-6 md:grid-cols-2">
          <AnalyticsChartCard
            title="Volume trend"
            periodSubtitle={chartSubtitle}
            detailHint="Appointment count per time bucket for the selected period filter."
            icon={BarChart3}
            loading={loading}
          >
            <AnalyticsLineChart
              data={trend}
              emptyKind="volume-trend"
              period={period}
            />
          </AnalyticsChartCard>
          <AnalyticsChartCard
            title="Busiest weekday"
            periodSubtitle={chartSubtitle}
            detailHint="Appointment counts per weekday within the selected chart period."
            icon={CalendarDays}
            loading={loading}
          >
            <AnalyticsBarChart
              data={weekday}
              emptyKind="busiest-weekday"
              period={period}
            />
          </AnalyticsChartCard>
          <AnalyticsChartCard
            title="Status over time"
            periodSubtitle={chartSubtitle}
            detailHint="Stacked status buckets follow the chart period (hours, days, or months)."
            icon={Layers}
            loading={loading}
            className="md:col-span-2"
          >
            <AnalyticsStackedBarChart
              data={statusOverTime}
              emptyKind="status-over-time"
              period={period}
            />
          </AnalyticsChartCard>
          <AnalyticsChartCard
            title="By category"
            periodSubtitle={chartSubtitle}
            detailHint="Appointment counts grouped by category within the selected chart period."
            icon={FolderTree}
            loading={loading}
          >
            {/* wrap layout: category names are long dynamic strings, not short date/weekday labels */}
            <AnalyticsBarChart
              data={categoryBars}
              emptyKind="by-category"
              period={period}
              xAxisLayout="wrap"
            />
          </AnalyticsChartCard>
          <AnalyticsChartCard
            title="Visit types"
            periodSubtitle={chartSubtitle}
            detailHint="Appointment type mix within the selected chart period."
            icon={PieChart}
            loading={loading}
          >
            <AnalyticsPieChart data={typePie} emptyKind="visit-types" period={period} />
          </AnalyticsChartCard>
        </div>
      </PortalPanelSection>

      <PortalPanelSection title="Patients" icon={Users} clipContent={false}>
        <div className="grid gap-6 md:grid-cols-2">
          <AnalyticsChartCard
            title="Age distribution"
            periodSubtitle={chartSubtitle}
            detailHint="Unique patients with appointments in the selected chart period."
            icon={UserRound}
            loading={loading}
          >
            <AnalyticsBarChart
              data={ageBars.map((b) => ({ label: b.label, count: b.count }))}
              emptyKind="age-distribution"
              period={period}
            />
          </AnalyticsChartCard>
          <AnalyticsChartCard
            title="Top patients"
            periodSubtitle={chartSubtitle}
            detailHint="Patients ranked by visit frequency in the selected chart period."
            icon={Users}
            loading={loading}
          >
            <AnalyticsTopPatientsPanel
              patients={topPatients}
              viewerRole={(viewerRole as "admin" | "doctor" | "patient" | null) ?? "admin"}
              loading={loading}
            />
          </AnalyticsChartCard>
        </div>
      </PortalPanelSection>

      <PortalPanelSection title="Revenue" icon={BadgeDollarSign} clipContent={false}>
        <AnalyticsRevenueStatsRow data={data} valueSkeleton={loading} period={period} />
        <div className="grid gap-6 md:grid-cols-2">
          <AnalyticsChartCard
            title="Paid revenue"
            periodSubtitle={chartSubtitle}
            detailHint={`Paid revenue collected in period: ${formatBillingKpiMoney(paidInPeriodCents)}`}
            icon={BadgeDollarSign}
            loading={loading}
          >
            <AnalyticsAreaChart
              data={revenueTrend}
              emptyKind="paid-revenue"
              period={period}
            />
          </AnalyticsChartCard>
          <AnalyticsChartCard
            title="Invoice status"
            periodSubtitle={chartSubtitle}
            detailHint="Invoice counts by status created within the selected chart period."
            icon={Receipt}
            loading={loading}
          >
            <AnalyticsBarChart
              data={invoiceStatus}
              emptyKind="invoice-status"
              period={period}
            />
          </AnalyticsChartCard>
        </div>
      </PortalPanelSection>

      {doctorsSection ? (
        <PortalPanelSection title="Doctors" icon={Stethoscope} clipContent={false}>
          <AnalyticsDoctorInsightsSection
            doctors={doctorsSection}
            chartSubtitle={chartSubtitle}
            period={period}
            loading={loading}
          />
        </PortalPanelSection>
      ) : null}
    </div>
  );
}
