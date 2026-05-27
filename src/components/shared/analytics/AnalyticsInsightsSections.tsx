"use client";

import {
  Activity,
  BarChart3,
  BadgeDollarSign,
  CalendarDays,
  FolderTree,
  Inbox,
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
import { AnalyticsRevenueStatsRow } from "@/components/shared/analytics/AnalyticsRevenueStatsRow";
import { AnalyticsStatusSummaryRow } from "@/components/shared/analytics/AnalyticsStatusSummaryRow";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { InsightsAppointmentsPanelHeader } from "@/components/insights/InsightsAppointmentsPanelHeader";
import type { InsightsPayload } from "@/lib/insights-data";
import { getInsightsChartContextSubtitle } from "@/lib/insights-chart-subtitle";
import { resolveInsightsScopeChartLabel } from "@/lib/insights-scope-display";
import type { InsightsQueryKey } from "@/lib/insights-scope";
import type { InsightsPeriod } from "@/lib/insights/insights-period";
import { isAdminRole } from "@/lib/rbac";

function formatCents(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

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
  const organizationWide = insightsQuery.scope === "organization";
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
  const showDoctors = isAdminRole(viewerRole) && organizationWide && v2?.doctors;

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
  const topPatientsEmpty = !loading && topPatients.length === 0;

  return (
    <div className="space-y-6">
      <PortalPanelSection
        title="Appointments"
        icon={BarChart3}
        headerSlot={
          <InsightsAppointmentsPanelHeader
            overall={appointmentsAllTime}
            untilToday={untilToday}
            upcoming={upcomingScheduled}
            period={period}
            onPeriodChange={onPeriodChange}
            disabled={periodControlsDisabled}
            loading={loading}
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
            <AnalyticsBarChart
              data={categoryBars}
              emptyKind="by-category"
              period={period}
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

      <PortalPanelSection title="Patients" icon={Users}>
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
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient</TableHead>
                  <TableHead className="text-right">Visits</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading
                  ? Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                        <TableCell className="text-right"><Skeleton className="h-5 w-12 ml-auto" /></TableCell>
                      </TableRow>
                    ))
                  : topPatientsEmpty
                    ? (
                        <TableRow>
                          <TableCell colSpan={2} className="py-10">
                            <div className="flex flex-col items-center justify-center gap-2 text-center text-muted-foreground">
                              <Inbox className="h-8 w-8 text-muted-foreground/60" aria-hidden />
                              <p className="text-sm font-medium">No patient visits in this period</p>
                              <p className="max-w-xs text-xs text-muted-foreground/90">
                                Top patients will rank here when appointments are recorded in the selected range.
                              </p>
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    : topPatients.map((p, idx) => (
                        <TableRow key={idx}>
                          <TableCell className="font-medium">{p.name}</TableCell>
                          <TableCell className="text-right">
                            <Badge variant="secondary">{p.count}</Badge>
                          </TableCell>
                        </TableRow>
                      ))}
              </TableBody>
            </Table>
          </AnalyticsChartCard>
        </div>
      </PortalPanelSection>

      <PortalPanelSection title="Revenue" icon={BadgeDollarSign}>
        <AnalyticsRevenueStatsRow data={data} valueSkeleton={loading} />
        <div className="grid gap-6 md:grid-cols-2">
          <AnalyticsChartCard
            title="Paid revenue"
            periodSubtitle={chartSubtitle}
            detailHint={`Paid revenue collected in period: ${formatCents(paidInPeriodCents)}`}
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

      {showDoctors && v2?.doctors ? (
        <PortalPanelSection title="Doctors" icon={Stethoscope}>
          <div className="grid gap-6 md:grid-cols-2">
            <AnalyticsChartCard
              title="Appointments by doctor"
              periodSubtitle={chartSubtitle}
              detailHint="Organization-wide appointment volume per doctor in the selected chart period."
              icon={Activity}
              loading={loading}
            >
              <AnalyticsBarChart
                data={v2.doctors.byDoctor.slice(0, 12).map((d) => ({
                  label: d.name.length > 12 ? `${d.name.slice(0, 12)}…` : d.name,
                  count: d.appointmentCount,
                }))}
                emptyKind="appointments-by-doctor"
                period={period}
              />
            </AnalyticsChartCard>
            <AnalyticsChartCard
              title="By specialty"
              periodSubtitle={chartSubtitle}
              detailHint="Organization-wide appointment volume by specialty in the selected chart period."
              icon={Stethoscope}
              loading={loading}
            >
              <AnalyticsPieChart
                data={v2.doctors.bySpecialty.map((s) => ({
                  name: s.specialty,
                  count: s.count,
                }))}
                emptyKind="by-specialty"
                period={period}
              />
            </AnalyticsChartCard>
          </div>
        </PortalPanelSection>
      ) : null}
    </div>
  );
}
