"use client";

import {
  Activity,
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
  organizationWide: boolean;
  period: InsightsPeriod;
  onPeriodChange: (next: InsightsPeriod) => void;
  periodControlsDisabled?: boolean;
};

/** Domain-grouped Recharts sections for /insights. */
export function AnalyticsInsightsSections({
  data,
  loading,
  viewerRole,
  organizationWide,
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
  const showDoctors = isAdminRole(viewerRole) && organizationWide && v2?.doctors;
  const chartPeriodLabel = v2?.meta.periodLabel ?? "Selected period";
  const byStatus = v2?.appointments.byStatus ?? data?.byStatus;
  /** All-time appointment count in current scope (doctor practice or org / selected doctor). */
  const appointmentsAllTime =
    v2?.appointments.totals.all ?? data?.overview.total ?? 0;
  const upcomingScheduled = v2?.appointments.totals.upcoming ?? data?.overview.upcoming ?? 0;
  const untilToday = Math.max(0, appointmentsAllTime - upcomingScheduled);

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
          loading={loading}
          className="mb-4"
        />
        <div className="grid gap-6 md:grid-cols-2">
          <AnalyticsChartCard
            title="Volume trend"
            subtitle={v2?.meta.periodLabel ?? "Over selected period"}
            detailHint="Appointment count per time bucket for the selected period filter."
            icon={BarChart3}
            loading={loading}
          >
            <AnalyticsLineChart data={trend} />
          </AnalyticsChartCard>
          <AnalyticsChartCard
            title="Busiest weekday"
            subtitle={`By day of week · ${chartPeriodLabel}`}
            detailHint="Appointment counts per weekday within the selected chart period."
            icon={CalendarDays}
            loading={loading}
          >
            <AnalyticsBarChart data={weekday} />
          </AnalyticsChartCard>
          <AnalyticsChartCard
            title="Status over time"
            subtitle={`Done / pending / alert · ${chartPeriodLabel}`}
            detailHint="Stacked status buckets follow the chart period (hours, days, or months)."
            icon={Layers}
            loading={loading}
            className="md:col-span-2"
          >
            <AnalyticsStackedBarChart data={statusOverTime} />
          </AnalyticsChartCard>
          <AnalyticsChartCard
            title="By category"
            subtitle={`By category · ${chartPeriodLabel}`}
            icon={FolderTree}
            loading={loading}
          >
            <AnalyticsBarChart data={categoryBars} />
          </AnalyticsChartCard>
          <AnalyticsChartCard
            title="Visit types"
            subtitle="Appointment type mix"
            icon={PieChart}
            loading={loading}
          >
            <AnalyticsPieChart data={typePie} />
          </AnalyticsChartCard>
        </div>
      </PortalPanelSection>

      <PortalPanelSection title="Patients" icon={Users}>
        <div className="grid gap-6 md:grid-cols-2">
          <AnalyticsChartCard
            title="Age distribution"
            subtitle="Unique patients in period"
            icon={UserRound}
            loading={loading}
          >
            <AnalyticsBarChart
              data={ageBars.map((b) => ({ label: b.label, count: b.count }))}
            />
          </AnalyticsChartCard>
          <AnalyticsChartCard title="Top patients" subtitle="By visit frequency" icon={Users} loading={loading}>
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
            subtitle={`${formatCents(v2?.revenue.paidInPeriod ?? data?.revenueThisMonth ?? 0)} in period`}
            icon={BadgeDollarSign}
            loading={loading}
          >
            <AnalyticsAreaChart data={revenueTrend} />
          </AnalyticsChartCard>
          <AnalyticsChartCard
            title="Invoice status"
            subtitle={`By status · ${chartPeriodLabel}`}
            detailHint="Invoice counts by status created within the selected chart period."
            icon={Receipt}
            loading={loading}
          >
            <AnalyticsBarChart data={invoiceStatus} />
          </AnalyticsChartCard>
        </div>
      </PortalPanelSection>

      {showDoctors && v2?.doctors ? (
        <PortalPanelSection title="Doctors" icon={Stethoscope}>
          <div className="grid gap-6 md:grid-cols-2">
            <AnalyticsChartCard
              title="Appointments by doctor"
              subtitle="Organization-wide"
              icon={Activity}
              loading={loading}
            >
              <AnalyticsBarChart
                data={v2.doctors.byDoctor.slice(0, 12).map((d) => ({
                  label: d.name.length > 12 ? `${d.name.slice(0, 12)}…` : d.name,
                  count: d.appointmentCount,
                }))}
              />
            </AnalyticsChartCard>
            <AnalyticsChartCard
              title="By specialty"
              subtitle="Appointment volume"
              icon={Stethoscope}
              loading={loading}
            >
              <AnalyticsPieChart
                data={v2.doctors.bySpecialty.map((s) => ({
                  name: s.specialty,
                  count: s.count,
                }))}
              />
            </AnalyticsChartCard>
          </div>
        </PortalPanelSection>
      ) : null}
    </div>
  );
}
