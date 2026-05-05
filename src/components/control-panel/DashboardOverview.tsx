"use client";

import { useDashboardOverview } from "@/hooks/useDashboardOverview";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  ArrowRight,
  RefreshCw,
  Banknote,
  Receipt,
} from "lucide-react";
import { format } from "date-fns";
import { formatDistanceToNow } from "date-fns/formatDistanceToNow";

const STATUS_COLORS: Record<string, string> = {
  done: "bg-green-100 text-green-700 border-green-200",
  pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
  alert: "bg-red-100 text-red-700 border-red-200",
};

/** Reusable glassmorphic card surface (UI guide): subtle gradient, rounded corners, colored glow shadow. */
const CONTROL_PANEL_GLASS_CARD_BASE_CLASS =
  "rounded-[28px] border bg-gradient-to-br backdrop-blur-sm";
/** Same card style system with per-card color variant. */
const CONTROL_PANEL_GLASS_CARD_VARIANT: Record<string, string> = {
  sky: "border-sky-400/20 from-sky-500/10 via-white to-white/95 shadow-[0_24px_60px_rgba(2,132,199,0.12)]",
  blue: "border-blue-400/20 from-blue-500/10 via-white to-white/95 shadow-[0_24px_60px_rgba(59,130,246,0.12)]",
  indigo: "border-indigo-400/20 from-indigo-500/10 via-white to-white/95 shadow-[0_24px_60px_rgba(99,102,241,0.12)]",
  purple: "border-purple-400/20 from-purple-500/10 via-white to-white/95 shadow-[0_24px_60px_rgba(168,85,247,0.12)]",
  violet: "border-violet-400/20 from-violet-500/10 via-white to-white/95 shadow-[0_24px_60px_rgba(139,92,246,0.12)]",
  emerald: "border-emerald-400/20 from-emerald-500/10 via-white to-white/95 shadow-[0_24px_60px_rgba(16,185,129,0.12)]",
  green: "border-green-400/20 from-green-500/10 via-white to-white/95 shadow-[0_24px_60px_rgba(34,197,94,0.12)]",
  yellow: "border-yellow-400/20 from-yellow-500/10 via-white to-white/95 shadow-[0_24px_60px_rgba(234,179,8,0.12)]",
  amber: "border-amber-400/20 from-amber-500/10 via-white to-white/95 shadow-[0_24px_60px_rgba(245,158,11,0.12)]",
  orange: "border-orange-400/20 from-orange-500/10 via-white to-white/95 shadow-[0_24px_60px_rgba(249,115,22,0.12)]",
  rose: "border-rose-400/20 from-rose-500/10 via-white to-white/95 shadow-[0_24px_60px_rgba(225,29,72,0.12)]",
  teal: "border-teal-400/20 from-teal-500/10 via-white to-white/95 shadow-[0_24px_60px_rgba(20,184,166,0.12)]",
  cyan: "border-cyan-400/20 from-cyan-500/10 via-white to-white/95 shadow-[0_24px_60px_rgba(6,182,212,0.12)]",
  slate: "border-slate-400/20 from-slate-500/10 via-white to-white/95 shadow-[0_24px_60px_rgba(100,116,139,0.12)]",
};
/** Group row wrapper so each metric section has consistent spacing + glass surface. */
const CONTROL_PANEL_GROUP_SURFACE_CLASS =
  "space-y-3";

/** Keep same glass style while tinting per metric color token. */
function getControlPanelCardVariantClass(color: string) {
  const match = color.match(/bg-([a-z]+)-/);
  const variantKey = match?.[1] ?? "sky";
  return (
    CONTROL_PANEL_GLASS_CARD_VARIANT[variantKey] ??
    CONTROL_PANEL_GLASS_CARD_VARIANT.sky
  );
}

function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  color,
  href,
}: {
  label: string;
  value: number | string;
  sub?: string;
  icon: React.ElementType;
  color: string;
  href?: string;
}) {
  const inner = (
    <CardContent className="">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <p className="text-2xl font-bold tracking-tight mt-1">{value}</p>
          {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
        </div>
        <div className={`rounded-full p-2.5 ${color}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </CardContent>
  );

  return (
    <Card
      className={`${CONTROL_PANEL_GLASS_CARD_BASE_CLASS} ${getControlPanelCardVariantClass(color)} transition-shadow hover:shadow-[0_30px_70px_rgba(2,132,199,0.18)] ${href ? "cursor-pointer" : ""}`}
    >
      {href ? <Link href={href}>{inner}</Link> : inner}
    </Card>
  );
}

function StatCardSkeleton() {
  return (
    <Card>
      <CardContent className="pt-6 pb-4">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-3 w-20" />
          </div>
          <Skeleton className="h-10 w-10 rounded-full" />
        </div>
      </CardContent>
    </Card>
  );
}

export default function DashboardOverviewComponent() {
  const { data, isLoading, isFetching, dataUpdatedAt, refetch } = useDashboardOverview();

  if (isLoading) {
    return (
      <div className="space-y-6 animate-in fade-in">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Skeleton className="h-8 w-56" />
            <Skeleton className="h-4 w-72" />
          </div>
          <Skeleton className="h-9 w-24" />
        </div>
        {/* Row 1 */}
        <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)}
        </div>
        {/* Row 2 */}
        <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)}
        </div>
        {/* Bottom cards */}
        <div className="grid gap-4 lg:grid-cols-2">
          <Card><CardContent className="pt-6"><Skeleton className="h-48 w-full" /></CardContent></Card>
          <Card><CardContent className="pt-6"><Skeleton className="h-48 w-full" /></CardContent></Card>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { appointments, patients, doctors, categories, nextAppointment, recentAppointments, revenue } = data;
  const paidEur = (revenue.paidCents / 100).toFixed(2);
  const outstandingEur = (revenue.outstandingCents / 100).toFixed(2);

  return (
    <div className="space-y-3 pb-3 animate-in fade-in">
      {/* Same chrome as other control-panel tabs (`PatientManagement`, etc.) via shared `PageHeader`. */}
      <PageHeader

        title="Dashboard Overview"
        description={`Real-time system summary — last updated ${format(
          dataUpdatedAt ? new Date(dataUpdatedAt) : new Date(),
          "HH:mm:ss"
        )}`}
        actions={
          <Button
            variant="ghost"
            size="sm"
            onClick={async () => {
              await refetch();
            }}
            disabled={isFetching}
            className={skyGlassBackButtonClass}
            aria-busy={isFetching}
          >
            <RefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
            {isFetching ? "Refreshing..." : "Refresh"}
          </Button>
        }
      />

      {/* Appointment Stats */}
      <div className={CONTROL_PANEL_GROUP_SURFACE_CLASS}>
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Appointments</p>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <StatCard label="Today" value={appointments.today} sub="appointments scheduled" icon={CalendarDays} color="bg-blue-100 text-blue-600" href="/control-panel" />
          <StatCard label="This Week" value={appointments.thisWeek} sub="this calendar week" icon={CalendarClock} color="bg-indigo-100 text-indigo-600" />
          <StatCard label="This Month" value={appointments.thisMonth} sub={`of ${appointments.total} total`} icon={TrendingUp} color="bg-purple-100 text-purple-600" />
          <StatCard label="Overdue" value={appointments.overdue} sub="need attention" icon={AlertTriangle} color="bg-orange-100 text-orange-600" />
        </div>
      </div>

      {/* Status Stats */}
      <div className={CONTROL_PANEL_GROUP_SURFACE_CLASS}>
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status Breakdown</p>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <StatCard label="Done" value={appointments.done} sub="completed" icon={CalendarCheck} color="bg-green-100 text-green-600" />
          <StatCard label="Pending" value={appointments.pending} sub="in progress" icon={Clock} color="bg-yellow-100 text-yellow-600" />
          <StatCard label="Alert" value={appointments.alert} sub="need action" icon={CalendarX} color="bg-red-100 text-red-600" />
          <StatCard label="Total All Time" value={appointments.total} sub="all appointments" icon={CalendarDays} color="bg-gray-100 text-gray-600" />
        </div>
      </div>

      {/* People & System Stats */}
      <div className={CONTROL_PANEL_GROUP_SURFACE_CLASS}>
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">System</p>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <StatCard label="Total Patients" value={patients.total} sub={`${patients.active} active`} icon={Users} color="bg-teal-100 text-teal-600" href="/control-panel" />
          <StatCard label="Active Patients" value={patients.active} sub="currently active" icon={UserCheck} color="bg-emerald-100 text-emerald-600" />
          <StatCard label="Doctors" value={doctors} sub="registered staff" icon={Stethoscope} color="bg-cyan-100 text-cyan-600" href="/control-panel" />
          <StatCard label="Categories" value={categories} sub="appointment types" icon={Tag} color="bg-violet-100 text-violet-600" />
        </div>
      </div>

      {/* Revenue Stats */}
      <div className={CONTROL_PANEL_GROUP_SURFACE_CLASS}>
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Revenue</p>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <StatCard label="Paid Revenue" value={`€${paidEur}`} sub={`${revenue.paidInvoices} paid invoices`} icon={Banknote} color="bg-green-100 text-green-600" href="/control-panel" />
          <StatCard label="Outstanding" value={`€${outstandingEur}`} sub="awaiting payment" icon={Receipt} color="bg-amber-100 text-amber-600" />
          <StatCard label="Total Invoices" value={revenue.totalInvoices} sub="all time" icon={Receipt} color="bg-blue-100 text-blue-600" />
          <StatCard label="Paid Invoices" value={revenue.paidInvoices} sub={`of ${revenue.totalInvoices} total`} icon={CalendarCheck} color="bg-emerald-100 text-emerald-600" />
        </div>
      </div>

      {/* Next Appointment + Recent Appointments — bottom margin so last `shadow-xl` clears the tab scrollport. */}
      <div className={`${CONTROL_PANEL_GROUP_SURFACE_CLASS} grid gap-4 lg:grid-cols-2`}>
        {/* Next Appointment */}
        <Card className={`${CONTROL_PANEL_GLASS_CARD_BASE_CLASS} ${CONTROL_PANEL_GLASS_CARD_VARIANT.indigo}`}>
          {/* CardHeader defaults to horizontal padding only; match `CardContent` (`p-4 sm:p-6`) so title block aligns with stat cards. */}
          <CardHeader className="border-b border-border/70 p-4 sm:p-6">
            <CardTitle className="text-base flex items-center gap-2">
              <CalendarClock className="h-4 w-4 text-blue-500" />
              Next Appointment
            </CardTitle>
            <CardDescription>Upcoming appointment from your queue</CardDescription>
          </CardHeader>
          <CardContent>
            {nextAppointment ? (
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1 flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">{nextAppointment.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(nextAppointment.start), "EEE, dd MMM yyyy · HH:mm")}
                      {" — "}
                      {format(new Date(nextAppointment.end), "HH:mm")}
                    </p>
                    {nextAppointment.location && (
                      <p className="text-xs text-muted-foreground truncate">📍 {nextAppointment.location}</p>
                    )}
                    <p className="text-xs text-blue-600 font-medium">
                      {formatDistanceToNow(new Date(nextAppointment.start), { addSuffix: true })}
                    </p>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/control-panel/appointments/${nextAppointment.id}`} className="gap-1">
                      View <ArrowRight className="h-3 w-3" />
                    </Link>
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground py-4 text-center">No upcoming appointments.</p>
            )}
          </CardContent>
        </Card>

        {/* Recent Appointments */}
        <Card className={`${CONTROL_PANEL_GLASS_CARD_BASE_CLASS} ${CONTROL_PANEL_GLASS_CARD_VARIANT.violet}`}>
          <CardHeader className="border-b border-border/70 p-4 sm:p-6">
            <CardTitle className="text-base flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-purple-500" />
              Recently Created
            </CardTitle>
            <CardDescription>Last 5 created appointments</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {recentAppointments.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No appointments yet.</p>
            ) : (
              recentAppointments.map((appt) => (
                <div key={appt.id} className="flex items-center gap-3 py-1.5 border-b last:border-0">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{appt.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(appt.start), "dd MMM · HH:mm")}
                      {appt.patientName && ` · ${appt.patientName}`}
                    </p>
                  </div>
                  {appt.status && (
                    <Badge
                      variant="outline"
                      className={`text-xs capitalize shrink-0 ${STATUS_COLORS[appt.status] ?? ""}`}
                    >
                      {appt.status}
                    </Badge>
                  )}
                  <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" asChild>
                    <Link href={`/control-panel/appointments/${appt.id}`}>
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  </Button>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
