"use client";

import { useDashboardOverview } from "@/hooks/useDashboardOverview";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
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
import { format, formatDistanceToNow } from "date-fns";

const STATUS_COLORS: Record<string, string> = {
  done: "bg-green-100 text-green-700 border-green-200",
  pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
  alert: "bg-red-100 text-red-700 border-red-200",
};

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
    <CardContent className="pt-6 pb-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <p className="text-3xl font-bold tracking-tight mt-1">{value}</p>
          {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
        </div>
        <div className={`rounded-full p-2.5 ${color}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </CardContent>
  );

  return (
    <Card className={`transition-shadow hover:shadow-md ${href ? "cursor-pointer" : ""}`}>
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
  const { data, isLoading, refetch } = useDashboardOverview();

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
    <div className="space-y-6 animate-in fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Dashboard Overview</h2>
          <p className="text-muted-foreground text-sm">
            Real-time system summary — last updated {format(new Date(), "HH:mm")}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Appointment Stats */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Appointments</p>
        <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
          <StatCard label="Today" value={appointments.today} sub="appointments scheduled" icon={CalendarDays} color="bg-blue-100 text-blue-600" href="/control-panel" />
          <StatCard label="This Week" value={appointments.thisWeek} sub="this calendar week" icon={CalendarClock} color="bg-indigo-100 text-indigo-600" />
          <StatCard label="This Month" value={appointments.thisMonth} sub={`of ${appointments.total} total`} icon={TrendingUp} color="bg-purple-100 text-purple-600" />
          <StatCard label="Overdue" value={appointments.overdue} sub="need attention" icon={AlertTriangle} color="bg-orange-100 text-orange-600" />
        </div>
      </div>

      {/* Status Stats */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Status Breakdown</p>
        <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
          <StatCard label="Done" value={appointments.done} sub="completed" icon={CalendarCheck} color="bg-green-100 text-green-600" />
          <StatCard label="Pending" value={appointments.pending} sub="in progress" icon={Clock} color="bg-yellow-100 text-yellow-600" />
          <StatCard label="Alert" value={appointments.alert} sub="need action" icon={CalendarX} color="bg-red-100 text-red-600" />
          <StatCard label="Total All Time" value={appointments.total} sub="all appointments" icon={CalendarDays} color="bg-gray-100 text-gray-600" />
        </div>
      </div>

      <Separator />

      {/* People & System Stats */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">System</p>
        <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
          <StatCard label="Total Patients" value={patients.total} sub={`${patients.active} active`} icon={Users} color="bg-teal-100 text-teal-600" href="/control-panel" />
          <StatCard label="Active Patients" value={patients.active} sub="currently active" icon={UserCheck} color="bg-emerald-100 text-emerald-600" />
          <StatCard label="Doctors" value={doctors} sub="registered staff" icon={Stethoscope} color="bg-cyan-100 text-cyan-600" href="/control-panel" />
          <StatCard label="Categories" value={categories} sub="appointment types" icon={Tag} color="bg-violet-100 text-violet-600" />
        </div>
      </div>

      {/* Revenue Stats */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Revenue</p>
        <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
          <StatCard label="Paid Revenue" value={`€${paidEur}`} sub={`${revenue.paidInvoices} paid invoices`} icon={Banknote} color="bg-green-100 text-green-600" href="/control-panel" />
          <StatCard label="Outstanding" value={`€${outstandingEur}`} sub="awaiting payment" icon={Receipt} color="bg-amber-100 text-amber-600" />
          <StatCard label="Total Invoices" value={revenue.totalInvoices} sub="all time" icon={Receipt} color="bg-blue-100 text-blue-600" />
          <StatCard label="Paid Invoices" value={revenue.paidInvoices} sub={`of ${revenue.totalInvoices} total`} icon={CalendarCheck} color="bg-emerald-100 text-emerald-600" />
        </div>
      </div>

      {/* Next Appointment + Recent Appointments */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Next Appointment */}
        <Card>
          <CardHeader className="pb-3">
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
        <Card>
          <CardHeader className="pb-3">
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
