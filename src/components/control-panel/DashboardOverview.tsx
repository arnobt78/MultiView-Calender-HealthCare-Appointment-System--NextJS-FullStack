"use client";

/**
 * DashboardOverview — control panel overview tab.
 * Chrome (headers, stat tiles, queue panel shells) stays mounted; only value slots + list bodies pulse.
 * When SSR seeds queryKeys.dashboard.overview, skip skeleton until a refetch without cache.
 */

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/PageHeader";
import { skyGlassBackButtonClass } from "@/lib/calendar-header-action-styles";
import Link from "next/link";
import {
  CalendarDays,
  CalendarCheck,
  CalendarClock,
  CalendarX,
  Users,
  UserCheck,
  Stethoscope,
  Tag,
  TrendingUp,
  AlertTriangle,
  Clock,
  RefreshCw,
  Banknote,
  Receipt,
  AlertCircle,
} from "lucide-react";
import { format } from "date-fns";
import { useDashboardOverview } from "@/hooks/useDashboardOverview";
import { DashboardQueuePanelCard } from "@/components/control-panel/dashboard/DashboardQueuePanelCard";
import { DashboardNextAppointmentBody } from "@/components/control-panel/dashboard/DashboardNextAppointmentBody";
import { DashboardRecentAppointmentsBody } from "@/components/control-panel/dashboard/DashboardRecentAppointmentsBody";
import {
  controlPanelDashboardQueueGridClass,
  controlPanelGlassCardBaseClass,
  controlPanelGroupSurfaceClass,
  getControlPanelCardVariantClass,
} from "@/lib/control-panel-glass-card";

function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  color,
  href,
  loading,
}: {
  label: string;
  value: number | string;
  sub?: string;
  icon: React.ElementType;
  color: string;
  href?: string;
  loading?: boolean;
}) {
  const inner = (
    <CardContent className="">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          {loading ? (
            <Skeleton className="mt-1 h-8 w-16 rounded-lg" />
          ) : (
            <p className="mt-1 text-2xl font-bold tracking-tight text-gray-700">{value}</p>
          )}
          {sub && <p className="mt-1 text-xs text-muted-foreground">{sub}</p>}
        </div>
        <div className={`rounded-full p-2.5 ${color}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </CardContent>
  );

  return (
    <Card
      className={`${controlPanelGlassCardBaseClass} ${getControlPanelCardVariantClass(color)} transition-shadow hover:shadow-[0_30px_70px_rgba(2,132,199,0.18)] ${href ? "cursor-pointer" : ""}`}
    >
      {href ? <Link href={href}>{inner}</Link> : inner}
    </Card>
  );
}

export default function DashboardOverviewComponent() {
  const { data, isLoading, isFetching, dataUpdatedAt, refetch, isError } = useDashboardOverview();

  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    requestAnimationFrame(() => setIsMounted(true));
  }, []);

  /** SSR/cache seed: show real values immediately; pulse only when no payload yet. */
  const hasData = data != null;
  const listBodyLoading = !hasData && (!isMounted || isLoading);
  const statValueLoading = listBodyLoading;

  const fetchingDisplay = isMounted && isFetching;

  const appointments = data?.appointments;
  const patients = data?.patients;
  const revenue = data?.revenue;
  const paidEur = revenue ? (revenue.paidCents / 100).toFixed(2) : "0.00";
  const outstandingEur = revenue ? (revenue.outstandingCents / 100).toFixed(2) : "0.00";
  const upcomingAppointments = data?.upcomingAppointments ?? [];
  const recentAppointments = data?.recentAppointments ?? [];

  if (isError) {
    return (
      <div className="space-y-3 pb-2">
        <PageHeader title="Dashboard Overview" description="Real-time system summary" />
        <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <AlertCircle className="h-4 w-4 shrink-0" />
          Failed to load dashboard data. Please refresh.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3 pb-2">
      <PageHeader
        title="Dashboard Overview"
        description={
          statValueLoading
            ? "Real-time system summary"
            : `Real-time system summary — last updated ${format(
                dataUpdatedAt ? new Date(dataUpdatedAt) : new Date(),
                "HH:mm:ss"
              )}`
        }
        actions={
          <Button
            variant="ghost"
            size="sm"
            onClick={async () => {
              await refetch();
            }}
            disabled={fetchingDisplay}
            className={skyGlassBackButtonClass}
            aria-busy={fetchingDisplay}
          >
            <RefreshCw className={`h-4 w-4 ${fetchingDisplay ? "animate-spin" : ""}`} />
            {fetchingDisplay ? "Refreshing..." : "Refresh"}
          </Button>
        }
      />

      <div className={controlPanelGroupSurfaceClass}>
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Appointments</p>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <StatCard label="Today" value={appointments?.today ?? 0} sub="appointments scheduled" icon={CalendarDays} color="bg-blue-100 text-blue-600" href="/control-panel" loading={statValueLoading} />
          <StatCard label="This Week" value={appointments?.thisWeek ?? 0} sub="this calendar week" icon={CalendarClock} color="bg-indigo-100 text-indigo-600" loading={statValueLoading} />
          <StatCard label="This Month" value={appointments?.thisMonth ?? 0} sub={statValueLoading ? "vs. total appointments" : `of ${appointments?.total ?? 0} total`} icon={TrendingUp} color="bg-purple-100 text-purple-600" loading={statValueLoading} />
          <StatCard label="Overdue" value={appointments?.overdue ?? 0} sub="need attention" icon={AlertTriangle} color="bg-orange-100 text-orange-600" loading={statValueLoading} />
        </div>
      </div>

      <div className={controlPanelGroupSurfaceClass}>
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status Breakdown</p>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <StatCard label="Done" value={appointments?.done ?? 0} sub="completed" icon={CalendarCheck} color="bg-green-100 text-green-600" loading={statValueLoading} />
          <StatCard label="Pending" value={appointments?.pending ?? 0} sub="in progress" icon={Clock} color="bg-yellow-100 text-yellow-600" loading={statValueLoading} />
          <StatCard label="Alert" value={appointments?.alert ?? 0} sub="need action" icon={CalendarX} color="bg-red-100 text-red-600" loading={statValueLoading} />
          <StatCard label="Total All Time" value={appointments?.total ?? 0} sub="all appointments" icon={CalendarDays} color="bg-gray-100 text-gray-600" loading={statValueLoading} />
        </div>
      </div>

      <div className={controlPanelGroupSurfaceClass}>
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">System</p>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <StatCard label="Total Patients" value={patients?.total ?? 0} sub={statValueLoading ? "patients" : `${patients?.active ?? 0} active`} icon={Users} color="bg-teal-100 text-teal-600" href="/control-panel" loading={statValueLoading} />
          <StatCard label="Active Patients" value={patients?.active ?? 0} sub="currently active" icon={UserCheck} color="bg-emerald-100 text-emerald-600" loading={statValueLoading} />
          <StatCard label="Doctors" value={data?.doctors ?? 0} sub="registered staff" icon={Stethoscope} color="bg-cyan-100 text-cyan-600" href="/control-panel" loading={statValueLoading} />
          <StatCard label="Categories" value={data?.categories ?? 0} sub="appointment types" icon={Tag} color="bg-violet-100 text-violet-600" loading={statValueLoading} />
        </div>
      </div>

      <div className={controlPanelGroupSurfaceClass}>
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Revenue</p>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <StatCard label="Paid Revenue" value={`€${paidEur}`} sub={statValueLoading ? "paid invoices" : `${revenue?.paidInvoices ?? 0} paid invoices`} icon={Banknote} color="bg-green-100 text-green-600" href="/control-panel" loading={statValueLoading} />
          <StatCard label="Outstanding" value={`€${outstandingEur}`} sub="awaiting payment" icon={Receipt} color="bg-amber-100 text-amber-600" loading={statValueLoading} />
          <StatCard label="Total Invoices" value={revenue?.totalInvoices ?? 0} sub="all time" icon={Receipt} color="bg-blue-100 text-blue-600" loading={statValueLoading} />
          <StatCard label="Paid Invoices" value={revenue?.paidInvoices ?? 0} sub={statValueLoading ? "of total" : `of ${revenue?.totalInvoices ?? 0} total`} icon={CalendarCheck} color="bg-emerald-100 text-emerald-600" loading={statValueLoading} />
        </div>
      </div>

      <div className={controlPanelDashboardQueueGridClass}>
        <DashboardQueuePanelCard
          title="Next Appointments"
          subtitle="Upcoming 5 appointments from your queue"
          icon={CalendarClock}
          iconClassName="[&_svg]:text-blue-600"
        >
          <DashboardNextAppointmentBody
            upcomingAppointments={upcomingAppointments}
            loading={listBodyLoading}
          />
        </DashboardQueuePanelCard>

        <DashboardQueuePanelCard
          title="Recently Created"
          subtitle="Last 5 created appointments"
          icon={CalendarDays}
          iconClassName="[&_svg]:text-violet-600"
        >
          <DashboardRecentAppointmentsBody
            appointments={recentAppointments}
            loading={listBodyLoading}
          />
        </DashboardQueuePanelCard>
      </div>
    </div>
  );
}
