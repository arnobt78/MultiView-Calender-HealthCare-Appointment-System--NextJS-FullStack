"use client";

/**
 * DashboardOverview — inline skeleton pattern (same as PatientManagement):
 *   - ALL chrome stays mounted: PageHeader, section headings, glass card shells, icon wrappers.
 *   - ONLY the numeric value slots + list content areas pulse while data is loading.
 *   - No full-tab skeleton replacement — no layout shift, no flicker on refetch.
 *   - `isMounted` + `requestAnimationFrame` guard matches the PatientManagement approach:
 *     ensures React hydrates with skeleton state on first paint, then swaps to real values.
 */

import { useDashboardOverview } from "@/hooks/useDashboardOverview";
import { useEffect, useState } from "react";
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
  AlertCircle,
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
/** Group row wrapper so each metric section has consistent spacing. */
const CONTROL_PANEL_GROUP_SURFACE_CLASS = "space-y-3";

/** Keep same glass style while tinting per metric color token. */
function getControlPanelCardVariantClass(color: string) {
  const match = color.match(/bg-([a-z]+)-/);
  const variantKey = match?.[1] ?? "sky";
  return (
    CONTROL_PANEL_GLASS_CARD_VARIANT[variantKey] ??
    CONTROL_PANEL_GLASS_CARD_VARIANT.sky
  );
}

/**
 * StatCard — glass card that keeps its shell, icon, and label static at all times.
 * When `loading` is true, the value + sub slots pulse as Skeletons; everything else stays.
 */
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
          {/* Label stays static — never skeletonized */}
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          {/* Value slot: pulse skeleton or real value */}
          {loading ? (
            <Skeleton className="h-8 w-16 mt-1 rounded-lg" />
          ) : (
            <p className="text-2xl font-bold tracking-tight mt-1">{value}</p>
          )}
          {/* Sub text always static — never skeletonized.
              Keeping sub visible at all times means the card height stays identical
              between skeleton and loaded states: no expand / contract layout shift. */}
          {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
        </div>
        {/* Icon stays static — never skeletonized */}
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

export default function DashboardOverviewComponent() {
  const { data, isLoading, isFetching, dataUpdatedAt, refetch, isError } = useDashboardOverview();

  /**
   * Mount guard (mirrors PatientManagement `listUiMounted`):
   * On first paint React hydrates with `isMounted=false` → loading=true → skeleton placeholders.
   * After the next animation frame (DOM painted) isMounted flips → real values replace skeletons.
   * This eliminates any server/client mismatch flash on hard refresh.
   */
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    requestAnimationFrame(() => setIsMounted(true));
  }, []);

  /** True whenever we should show skeleton in data slots. */
  const loading = !isMounted || isLoading;

  /**
   * fetchingDisplay — gates all isFetching-dependent Refresh button props.
   *
   * useDashboardOverview has no `enabled` guard, so TanStack Query begins
   * fetching immediately during SSR → isFetching=true on the server.
   * The client has localStorage-cached data → isFetching=false on first render.
   * Using raw `isFetching` on the button causes a hydration mismatch:
   *   Server:  disabled="", aria-busy="true", animate-spin, "Refreshing..."
   *   Client:  disabled={false}, aria-busy={false}, no spin, "Refresh"
   *
   * Gating with isMounted (false on both server and first client render) ensures
   * the button always renders in the "Refresh" (idle) state until after hydration,
   * making server and client HTML identical.
   */
  const fetchingDisplay = isMounted && isFetching;

  /** Safe-access helpers — while loading, these values are never rendered (skeletons show instead). */
  const appointments = data?.appointments;
  const patients = data?.patients;
  const revenue = data?.revenue;
  const paidEur = revenue ? (revenue.paidCents / 100).toFixed(2) : "0.00";
  const outstandingEur = revenue ? (revenue.outstandingCents / 100).toFixed(2) : "0.00";
  const nextAppointment = data?.nextAppointment;
  const recentAppointments = data?.recentAppointments ?? [];

  if (isError) {
    return (
      <div className="space-y-3 pb-2">
        <PageHeader title="Dashboard Overview" description="Real-time system summary" />
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          Failed to load dashboard data. Please refresh.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3 pb-2">
      {/* PageHeader stays completely static — title, description timestamp, and Refresh button never flash. */}
      <PageHeader
        title="Dashboard Overview"
        description={
          loading
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
            onClick={async () => { await refetch(); }}
            disabled={fetchingDisplay}
            className={skyGlassBackButtonClass}
            aria-busy={fetchingDisplay}
          >
            <RefreshCw className={`h-4 w-4 ${fetchingDisplay ? "animate-spin" : ""}`} />
            {fetchingDisplay ? "Refreshing..." : "Refresh"}
          </Button>
        }
      />

      {/* ─── Appointments ─────────────────────────────────────────────────── */}
      <div className={CONTROL_PANEL_GROUP_SURFACE_CLASS}>
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Appointments</p>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <StatCard label="Today" value={appointments?.today ?? 0} sub="appointments scheduled" icon={CalendarDays} color="bg-blue-100 text-blue-600" href="/control-panel" loading={loading} />
          <StatCard label="This Week" value={appointments?.thisWeek ?? 0} sub="this calendar week" icon={CalendarClock} color="bg-indigo-100 text-indigo-600" loading={loading} />
          {/*
           * `sub` must not contain live data during SSR — it causes hydration mismatch because
           * the server renders `of 0 total` (no cache) while the client reads `of N total` from
           * localStorage immediately. Use the `loading` guard so both server and client render
           * the same static placeholder until after hydration + data load.
           */}
          <StatCard label="This Month" value={appointments?.thisMonth ?? 0} sub={loading ? "vs. total appointments" : `of ${appointments?.total ?? 0} total`} icon={TrendingUp} color="bg-purple-100 text-purple-600" loading={loading} />
          <StatCard label="Overdue" value={appointments?.overdue ?? 0} sub="need attention" icon={AlertTriangle} color="bg-orange-100 text-orange-600" loading={loading} />
        </div>
      </div>

      {/* ─── Status Breakdown ─────────────────────────────────────────────── */}
      <div className={CONTROL_PANEL_GROUP_SURFACE_CLASS}>
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status Breakdown</p>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <StatCard label="Done" value={appointments?.done ?? 0} sub="completed" icon={CalendarCheck} color="bg-green-100 text-green-600" loading={loading} />
          <StatCard label="Pending" value={appointments?.pending ?? 0} sub="in progress" icon={Clock} color="bg-yellow-100 text-yellow-600" loading={loading} />
          <StatCard label="Alert" value={appointments?.alert ?? 0} sub="need action" icon={CalendarX} color="bg-red-100 text-red-600" loading={loading} />
          <StatCard label="Total All Time" value={appointments?.total ?? 0} sub="all appointments" icon={CalendarDays} color="bg-gray-100 text-gray-600" loading={loading} />
        </div>
      </div>

      {/* ─── System ───────────────────────────────────────────────────────── */}
      <div className={CONTROL_PANEL_GROUP_SURFACE_CLASS}>
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">System</p>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {/* Gate dynamic sub-text with loading to avoid hydration mismatch on first paint */}
          <StatCard label="Total Patients" value={patients?.total ?? 0} sub={loading ? "patients" : `${patients?.active ?? 0} active`} icon={Users} color="bg-teal-100 text-teal-600" href="/control-panel" loading={loading} />
          <StatCard label="Active Patients" value={patients?.active ?? 0} sub="currently active" icon={UserCheck} color="bg-emerald-100 text-emerald-600" loading={loading} />
          <StatCard label="Doctors" value={data?.doctors ?? 0} sub="registered staff" icon={Stethoscope} color="bg-cyan-100 text-cyan-600" href="/control-panel" loading={loading} />
          <StatCard label="Categories" value={data?.categories ?? 0} sub="appointment types" icon={Tag} color="bg-violet-100 text-violet-600" loading={loading} />
        </div>
      </div>

      {/* ─── Revenue ──────────────────────────────────────────────────────── */}
      <div className={CONTROL_PANEL_GROUP_SURFACE_CLASS}>
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Revenue</p>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {/* Gate dynamic sub-text with loading to avoid hydration mismatch on first paint */}
          <StatCard label="Paid Revenue" value={`€${paidEur}`} sub={loading ? "paid invoices" : `${revenue?.paidInvoices ?? 0} paid invoices`} icon={Banknote} color="bg-green-100 text-green-600" href="/control-panel" loading={loading} />
          <StatCard label="Outstanding" value={`€${outstandingEur}`} sub="awaiting payment" icon={Receipt} color="bg-amber-100 text-amber-600" loading={loading} />
          <StatCard label="Total Invoices" value={revenue?.totalInvoices ?? 0} sub="all time" icon={Receipt} color="bg-blue-100 text-blue-600" loading={loading} />
          <StatCard label="Paid Invoices" value={revenue?.paidInvoices ?? 0} sub={loading ? "of total" : `of ${revenue?.totalInvoices ?? 0} total`} icon={CalendarCheck} color="bg-emerald-100 text-emerald-600" loading={loading} />
        </div>
      </div>

      {/* ─── Bottom cards — Next Appointment + Recently Created ───────────── */}
      <div className={`${CONTROL_PANEL_GROUP_SURFACE_CLASS} grid gap-4 lg:grid-cols-2`}>
        {/* Next Appointment — card frame + header stay static */}
        <Card className={`${CONTROL_PANEL_GLASS_CARD_BASE_CLASS} ${CONTROL_PANEL_GLASS_CARD_VARIANT.indigo}`}>
          <CardHeader className="border-b border-border/70 p-4 sm:p-6">
            <CardTitle className="text-base flex items-center gap-2">
              <CalendarClock className="h-4 w-4 text-blue-500" />
              Next Appointment
            </CardTitle>
            <CardDescription>Upcoming appointment from your queue</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              /* Inline skeleton — only the data content area pulses */
              <div className="space-y-2 py-1">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-3/4 rounded" />
                    <Skeleton className="h-3 w-1/2 rounded" />
                    <Skeleton className="h-3 w-1/3 rounded" />
                  </div>
                  {/* Quick-link CTA — static chrome, no pulse */}
                  <div className="h-8 w-16 shrink-0" />
                </div>
              </div>
            ) : nextAppointment ? (
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
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

        {/* Recently Created — card frame + header stay static */}
        <Card className={`${CONTROL_PANEL_GLASS_CARD_BASE_CLASS} ${CONTROL_PANEL_GLASS_CARD_VARIANT.violet}`}>
          <CardHeader className="border-b border-border/70 p-4 sm:p-6">
            <CardTitle className="text-base flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-purple-500" />
              Recently Created
            </CardTitle>
            <CardDescription>Last 5 created appointments</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {loading ? (
              /* Skeleton rows match real row layout: title line + meta line + badge */
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center gap-2 py-1.5 border-b last:border-0">
                  <div className="flex-1 min-w-0 space-y-1">
                    <Skeleton className="h-4 w-3/4 rounded" />
                    <Skeleton className="h-3 w-1/2 rounded" />
                  </div>
                  <Skeleton className="h-5 w-16 rounded-full shrink-0" />
                  {/* Row action icon — static chrome, no pulse */}
                  <div className="h-7 w-7 shrink-0" />
                </div>
              ))
            ) : recentAppointments.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No appointments yet.</p>
            ) : (
              recentAppointments.map((appt) => (
                <div key={appt.id} className="flex items-center gap-2 py-1.5 border-b last:border-0">
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
