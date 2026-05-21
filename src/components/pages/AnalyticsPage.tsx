"use client";

/**
 * AnalyticsPage — inline skeleton pattern:
 *   - Page heading, section titles, card frames, and table headers stay mounted at all times.
 *   - Only stat values, chart bars, and table body rows pulse while loading.
 *   - `isMounted` + `requestAnimationFrame` guard prevents hydration flicker on first paint.
 *
 * Extended sections (v006):
 *   - Revenue metric cards (this month vs last, % delta)
 *   - Avg duration + new patients this month cards
 *   - Busiest day-of-week bar chart (SVG)
 *   - Status-over-time stacked bars (last 6 months)
 *   - Appointment type breakdown (progress bars)
 *   - Patient age distribution (horizontal bars)
 */

import { useEffect, useLayoutEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { useInsights } from "@/hooks/useInsights";
import type { InsightsPayload } from "@/lib/insights-data";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertCircle,
  ArrowDown,
  ArrowUp,
  BadgeDollarSign,
  CalendarCheck,
  CalendarClock,
  CalendarX,
  Clock,
  TrendingUp,
  Users,
  Activity,
  UserPlus,
} from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { cn } from "@/lib/utils";

/** Glass card variant per color — matches DashboardOverview / portal style. */
const GLASS: Record<string, string> = {
  blue: "rounded-[28px] border border-blue-400/20 bg-gradient-to-br from-blue-500/10 via-white to-white/95 backdrop-blur-sm shadow-[0_24px_60px_rgba(59,130,246,0.12)]",
  indigo: "rounded-[28px] border border-indigo-400/20 bg-gradient-to-br from-indigo-500/10 via-white to-white/95 backdrop-blur-sm shadow-[0_24px_60px_rgba(99,102,241,0.12)]",
  green: "rounded-[28px] border border-green-400/20 bg-gradient-to-br from-green-500/10 via-white to-white/95 backdrop-blur-sm shadow-[0_24px_60px_rgba(34,197,94,0.12)]",
  yellow: "rounded-[28px] border border-yellow-400/20 bg-gradient-to-br from-yellow-500/10 via-white to-white/95 backdrop-blur-sm shadow-[0_24px_60px_rgba(234,179,8,0.12)]",
  red: "rounded-[28px] border border-red-400/20 bg-gradient-to-br from-red-500/10 via-white to-white/95 backdrop-blur-sm shadow-[0_24px_60px_rgba(225,29,72,0.12)]",
  purple: "rounded-[28px] border border-purple-400/20 bg-gradient-to-br from-purple-500/10 via-white to-white/95 backdrop-blur-sm shadow-[0_24px_60px_rgba(168,85,247,0.12)]",
  slate: "rounded-[28px] border border-slate-400/20 bg-gradient-to-br from-slate-500/10 via-white to-white/95 backdrop-blur-sm shadow-[0_24px_60px_rgba(100,116,139,0.1)]",
  emerald: "rounded-[28px] border border-emerald-400/20 bg-gradient-to-br from-emerald-500/10 via-white to-white/95 backdrop-blur-sm shadow-[0_24px_60px_rgba(16,185,129,0.12)]",
  amber: "rounded-[28px] border border-amber-400/20 bg-gradient-to-br from-amber-500/10 via-white to-white/95 backdrop-blur-sm shadow-[0_24px_60px_rgba(245,158,11,0.12)]",
};

/** Format cents to USD string. */
function formatCents(cents: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(cents / 100);
}

/** Revenue delta percentage formatted with sign. */
function formatDelta(current: number, prev: number): { text: string; positive: boolean } | null {
  if (prev === 0) return null;
  const pct = Math.round(((current - prev) / prev) * 100);
  return { text: `${pct > 0 ? "+" : ""}${pct}%`, positive: pct >= 0 };
}

type AnalyticsPageProps = {
  /**
   * Server-prefetched insights — seeds queryKeys.insights.all so useInsights()
   * finds data immediately, charts render on first paint with no loading flash.
   */
  initialInsights?: InsightsPayload | null;
};

export default function AnalyticsPage({ initialInsights }: AnalyticsPageProps = {}) {
  const queryClient = useQueryClient();

  /**
   * Seed the insights cache with server-prefetched data before first paint.
   * useLayoutEffect fires synchronously so useInsights() below finds the data
   * already in cache — no skeleton flash on first load.
   */
  useLayoutEffect(() => {
    if (initialInsights != null) {
      queryClient.setQueryData(queryKeys.insights.all, initialInsights);
      queryClient.setQueryData(queryKeys.analytics.all, initialInsights);
    }
  }, [queryClient, initialInsights]);

  const { data, isLoading, isError } = useInsights();

  /**
   * Mount guard: hydrate with skeleton state on first paint, swap to real data
   * after the next animation frame — matches the PatientManagement pattern.
   */
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    requestAnimationFrame(() => setIsMounted(true));
  }, []);

  const loading = !isMounted || isLoading;

  const overview = data?.overview;
  const byStatus = data?.byStatus ?? {};
  const byCategory = data?.byCategory ?? {};
  const monthlyData = data?.monthlyData ?? Array.from({ length: 12 }, (_, i) => ({ month: `M${i + 1}`, count: 0 }));
  const topPatients = data?.topPatients ?? [];
  const revenueThisMonth = data?.revenueThisMonth ?? 0;
  const revenuePrevMonth = data?.revenuePrevMonth ?? 0;
  const busiestDay = data?.busiestDayOfWeek ?? [];
  const statusOverTime = data?.statusOverTime ?? [];
  const typeBreakdown = data?.appointmentTypeBreakdown ?? [];
  const ageDistribution = data?.ageDistribution ?? [];

  const maxMonthly = Math.max(...monthlyData.map((m) => m.count), 1);
  const maxDayCount = Math.max(...busiestDay.map((d) => d.count), 1);
  const maxTypeCount = Math.max(...typeBreakdown.map((t) => t.count), 1);
  const maxAgeBucket = Math.max(...ageDistribution.map((b) => b.count), 1);
  const maxStatusTotal = Math.max(
    ...statusOverTime.map((m) => m.done + m.pending + m.alert),
    1
  );

  const revenueDelta = formatDelta(revenueThisMonth, revenuePrevMonth);

  const statCards = [
    { label: "Total", value: overview?.total ?? 0, icon: Activity, color: "text-blue-600", glass: "blue" },
    { label: "Upcoming", value: overview?.upcoming ?? 0, icon: CalendarClock, color: "text-indigo-600", glass: "indigo" },
    { label: "Done", value: overview?.done ?? 0, icon: CalendarCheck, color: "text-green-600", glass: "green" },
    { label: "Pending", value: overview?.pending ?? 0, icon: CalendarClock, color: "text-yellow-600", glass: "yellow" },
    { label: "Overdue", value: overview?.overdue ?? 0, icon: CalendarX, color: "text-red-600", glass: "red" },
    { label: "This Month", value: overview?.thisMonth ?? 0, icon: TrendingUp, color: "text-purple-600", glass: "purple" },
  ];

  if (isError) {
    return (
      <div className="space-y-4">
        <PageHeader title="Analytics" description="Appointment insights and trends" />
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          Failed to load analytics data. Please refresh.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl md:text-2xl font-semibold tracking-tight">Business Analytics</h1>
        <p className="text-muted-foreground text-sm">Track your business performance, patient trends, appointment analytics and more.</p>
      </div>

      {/* ── Overview stat cards ─────────────────────────────────────────────────── */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
        {statCards.map((stat) => (
          <Card key={stat.label} className={GLASS[stat.glass]}>
            <CardContent className="pt-5 pb-4">
              <div className="flex items-center gap-2">
                <stat.icon className={`h-5 w-5 shrink-0 ${stat.color}`} />
                {loading ? (
                  <Skeleton className="h-7 w-12 rounded" />
                ) : (
                  <span className="text-xl md:text-2xl text-gray-700 font-semibold">{stat.value}</span>
                )}
              </div>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ── Extended metric cards: revenue, avg duration, new patients ──────────── */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {/* Revenue this month */}
        <Card className={GLASS.emerald}>
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center gap-2 mb-1">
              <BadgeDollarSign className="h-5 w-5 text-emerald-600 shrink-0" />
              {loading ? <Skeleton className="h-7 w-24 rounded" /> : (
                <span className="text-xl font-semibold text-gray-700">{formatCents(revenueThisMonth)}</span>
              )}
            </div>
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Revenue This Month</p>
              {!loading && revenueDelta && (
                <span className={cn("flex items-center gap-0.5 text-xs font-medium", revenueDelta.positive ? "text-emerald-600" : "text-red-600")}>
                  {revenueDelta.positive ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                  {revenueDelta.text}
                </span>
              )}
            </div>
            {!loading && revenuePrevMonth > 0 && (
              <p className="text-[11px] text-muted-foreground ">vs {formatCents(revenuePrevMonth)} last month</p>
            )}
          </CardContent>
        </Card>

        {/* Avg appointment duration */}
        <Card className={GLASS.amber}>
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="h-5 w-5 text-amber-600 shrink-0" />
              {loading ? <Skeleton className="h-7 w-16 rounded" /> : (
                <span className="text-xl font-semibold text-gray-700">{overview?.avgDurationMinutes ?? 0} min</span>
              )}
            </div>
            <p className="text-sm text-muted-foreground">Avg Appointment Duration</p>
          </CardContent>
        </Card>

        {/* New patients this month */}
        <Card className={GLASS.blue}>
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center gap-2 mb-1">
              <UserPlus className="h-5 w-5 text-blue-600 shrink-0" />
              {loading ? <Skeleton className="h-7 w-12 rounded" /> : (
                <span className="text-xl font-semibold text-gray-700">{overview?.newPatientsThisMonth ?? 0}</span>
              )}
            </div>
            <p className="text-sm text-muted-foreground">New Patients This Month</p>
          </CardContent>
        </Card>

        {/* Alert rate */}
        <Card className={GLASS.red}>
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center gap-2 mb-1">
              <AlertCircle className="h-5 w-5 text-red-600 shrink-0" />
              {loading ? <Skeleton className="h-7 w-16 rounded" /> : (
                <span className="text-xl font-semibold text-gray-700">
                  {overview?.total ? Math.round(((byStatus["alert"] ?? 0) / overview.total) * 100) : 0}%
                </span>
              )}
            </div>
            <p className="text-sm text-muted-foreground">Alert / Escalation Rate</p>
          </CardContent>
        </Card>
      </div>

      {/* ── Monthly trend + By Category ─────────────────────────────────────────── */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className={GLASS.slate}>
          <CardHeader>
            <CardTitle className="text-lg">Monthly Appointments</CardTitle>
            <CardDescription>Last 12 months</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-1 h-40">
              {monthlyData.map((m, idx) => (
                <div key={loading ? idx : m.month} className="flex-1 flex flex-col items-center gap-1">
                  {loading ? (
                    <Skeleton className="w-full rounded-t" style={{ height: `${20 + (idx % 5) * 18}px` }} />
                  ) : (
                    <>
                      <span className="text-[10px] text-muted-foreground">{m.count || ""}</span>
                      {m.count > 0 && (
                        <svg
                          className="w-full rounded-t"
                          viewBox="0 0 10 100"
                          preserveAspectRatio="none"
                          height={Math.max(4, Math.round((m.count / maxMonthly) * 160))}
                        >
                          <rect width="10" height="100" className="fill-primary/80 hover:fill-primary transition-colors" />
                        </svg>
                      )}
                      <span className="text-[9px] text-muted-foreground rotate-[-45deg] origin-center whitespace-nowrap">
                        {m.month}
                      </span>
                    </>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className={GLASS.indigo}>
          <CardHeader>
            <CardTitle className="text-lg">By Category</CardTitle>
            <CardDescription>Distribution across categories</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i}>
                    <div className="flex justify-between mb-1">
                      <Skeleton className="h-4 w-24 rounded" />
                      <Skeleton className="h-4 w-16 rounded" />
                    </div>
                    <Skeleton className="h-2 w-full rounded-full" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {Object.entries(byCategory)
                  .sort(([, a], [, b]) => b - a)
                  .map(([cat, count]) => {
                    const pct = overview?.total ? Math.round((count / overview.total) * 100) : 0;
                    return (
                      <div key={cat}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="font-medium">{cat}</span>
                          <span className="text-muted-foreground">{count} ({pct}%)</span>
                        </div>
                        <svg className="h-2 w-full rounded-full overflow-hidden" viewBox="0 0 100 8" preserveAspectRatio="none">
                          <rect className="fill-muted" width="100" height="8" />
                          <rect className="fill-primary/70 transition-all" width={pct} height="8" />
                        </svg>
                      </div>
                    );
                  })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className={GLASS.green}>
          <CardHeader>
            <CardTitle className="text-lg">By Status</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex flex-wrap gap-2">
                {["done", "pending", "alert"].map((s) => (
                  <div key={s} className="flex items-center gap-2">
                    <Skeleton className="h-5 w-16 rounded-full" />
                    <Skeleton className="h-7 w-8 rounded" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {Object.entries(byStatus).map(([status, count]) => (
                  <div key={status} className="flex items-center gap-2">
                    <Badge variant={status === "done" ? "default" : status === "pending" ? "secondary" : "outline"}>
                      {status}
                    </Badge>
                    <span className="text-gray-700 font-semibold">{count}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className={GLASS.purple}>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="h-5 w-5 text-purple-500" />
              Top Patients
            </CardTitle>
            <CardDescription>By visit frequency</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient</TableHead>
                  <TableHead className="text-right">Visits</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-4 w-32 rounded" /></TableCell>
                      <TableCell className="text-right"><Skeleton className="h-5 w-12 rounded-full ml-auto" /></TableCell>
                    </TableRow>
                  ))
                ) : topPatients.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={2} className="text-sm text-muted-foreground text-center py-4">
                      No patient data available
                    </TableCell>
                  </TableRow>
                ) : (
                  topPatients.map((p, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="text-gray-700 font-medium">{p.name}</TableCell>
                      <TableCell className="text-right">
                        <Badge variant="secondary">{p.count}</Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* ── Busiest day of week + Status over time ──────────────────────────────── */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Busiest day-of-week — SVG bar chart */}
        <Card className={GLASS.amber}>
          <CardHeader>
            <CardTitle className="text-lg">Busiest Day of Week</CardTitle>
            <CardDescription>Appointment count by weekday</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-end gap-2 h-32">
                {Array.from({ length: 7 }).map((_, i) => (
                  <Skeleton key={i} className="flex-1 rounded-t" style={{ height: `${24 + (i % 4) * 16}px` }} />
                ))}
              </div>
            ) : (
              <div className="flex items-end gap-2 h-32">
                {busiestDay.map((d) => (
                  <div key={d.day} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-[10px] text-muted-foreground">{d.count || ""}</span>
                    {d.count > 0 ? (
                      <svg
                        className="w-full rounded-t"
                        viewBox="0 0 10 100"
                        preserveAspectRatio="none"
                        height={Math.max(4, Math.round((d.count / maxDayCount) * 112))}
                      >
                        <rect width="10" height="100" className="fill-amber-400/80 hover:fill-amber-500 transition-colors" />
                      </svg>
                    ) : (
                      <div className="w-full h-1 rounded bg-muted" />
                    )}
                    <span className="text-[10px] text-muted-foreground">{d.label}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Status over time — stacked bars (last 6 months) */}
        <Card className={GLASS.slate}>
          <CardHeader>
            <CardTitle className="text-lg">Status Over Time</CardTitle>
            <CardDescription>Done / Pending / Alert — last 6 months</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-end gap-2 h-32">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="flex-1 rounded-t" style={{ height: `${24 + (i % 3) * 20}px` }} />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-end gap-2 h-32">
                  {statusOverTime.map((m) => {
                    const total = m.done + m.pending + m.alert;
                    const barH = Math.max(4, Math.round((total / maxStatusTotal) * 112));
                    const doneH = total > 0 ? Math.round((m.done / total) * barH) : 0;
                    const pendH = total > 0 ? Math.round((m.pending / total) * barH) : 0;
                    const alertH = barH - doneH - pendH;
                    return (
                      <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
                        <svg className="w-full rounded-t overflow-hidden" viewBox={`0 0 10 ${barH}`} preserveAspectRatio="none" height={barH}>
                          {/* Alert (top) */}
                          <rect y={0} width="10" height={alertH} className="fill-red-400/70" />
                          {/* Pending (middle) */}
                          <rect y={alertH} width="10" height={pendH} className="fill-amber-400/80" />
                          {/* Done (bottom) */}
                          <rect y={alertH + pendH} width="10" height={doneH} className="fill-emerald-500/80" />
                        </svg>
                        <span className="text-[9px] text-muted-foreground whitespace-nowrap">{m.month}</span>
                      </div>
                    );
                  })}
                </div>
                {/* Legend */}
                <div className="flex items-center gap-4 text-[11px] text-muted-foreground">
                  <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-sm bg-emerald-500/80 inline-block" /> Done</span>
                  <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-sm bg-amber-400/80 inline-block" /> Pending</span>
                  <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-sm bg-red-400/70 inline-block" /> Alert</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Appointment type breakdown + Age distribution ───────────────────────── */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Appointment type breakdown — progress bars */}
        <Card className={GLASS.blue}>
          <CardHeader>
            <CardTitle className="text-lg">Visit Type Breakdown</CardTitle>
            <CardDescription>Appointments per type</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i}>
                    <div className="flex justify-between mb-1">
                      <Skeleton className="h-4 w-28 rounded" />
                      <Skeleton className="h-4 w-12 rounded" />
                    </div>
                    <Skeleton className="h-2 w-full rounded-full" />
                  </div>
                ))}
              </div>
            ) : typeBreakdown.length === 0 ? (
              <p className="text-sm text-muted-foreground py-2">No appointment type data yet.</p>
            ) : (
              <div className="space-y-3">
                {typeBreakdown.map((t) => {
                  const pct = Math.round((t.count / maxTypeCount) * 100);
                  return (
                    <div key={t.name}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium truncate max-w-[160px]">{t.name}</span>
                        <span className="text-muted-foreground shrink-0">{t.count}</span>
                      </div>
                      <svg className="h-2 w-full rounded-full overflow-hidden" viewBox="0 0 100 8" preserveAspectRatio="none">
                        <rect className="fill-muted" width="100" height="8" />
                        <rect className="fill-blue-500/70 transition-all" width={pct} height="8" />
                      </svg>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Patient age distribution — horizontal bars */}
        <Card className={GLASS.purple}>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="h-5 w-5 text-purple-500" />
              Patient Age Distribution
            </CardTitle>
            <CardDescription>Unique patients by age bucket</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Skeleton className="h-4 w-10 rounded flex-shrink-0" />
                    <Skeleton className="h-5 flex-1 rounded" />
                    <Skeleton className="h-4 w-8 rounded flex-shrink-0" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-2.5">
                {ageDistribution.map((b) => {
                  const pct = maxAgeBucket > 0 ? Math.round((b.count / maxAgeBucket) * 100) : 0;
                  return (
                    <div key={b.label} className="flex items-center gap-2 text-sm">
                      <span className="w-10 text-xs text-muted-foreground shrink-0 text-right">{b.label}</span>
                      <div className="flex-1 h-5 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full rounded-full bg-purple-500/70 transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="w-8 text-xs text-muted-foreground shrink-0">{b.count}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
