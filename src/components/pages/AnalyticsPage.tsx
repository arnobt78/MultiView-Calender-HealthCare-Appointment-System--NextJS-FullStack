"use client";

/**
 * AnalyticsPage — inline skeleton pattern:
 *   - Page heading, section titles, card frames, and table headers stay mounted at all times.
 *   - Only stat values, chart bars, category rows, status counts, and table body rows pulse.
 *   - `isMounted` + `requestAnimationFrame` guard prevents hydration flicker on first paint.
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
  CalendarCheck,
  CalendarClock,
  CalendarX,
  TrendingUp,
  Users,
  Activity,
} from "lucide-react";

/** Glass card variant per color — matches DashboardOverview style. */
const GLASS: Record<string, string> = {
  blue: "rounded-[28px] border border-blue-400/20 bg-gradient-to-br from-blue-500/10 via-white to-white/95 backdrop-blur-sm shadow-[0_24px_60px_rgba(59,130,246,0.12)]",
  indigo: "rounded-[28px] border border-indigo-400/20 bg-gradient-to-br from-indigo-500/10 via-white to-white/95 backdrop-blur-sm shadow-[0_24px_60px_rgba(99,102,241,0.12)]",
  green: "rounded-[28px] border border-green-400/20 bg-gradient-to-br from-green-500/10 via-white to-white/95 backdrop-blur-sm shadow-[0_24px_60px_rgba(34,197,94,0.12)]",
  yellow: "rounded-[28px] border border-yellow-400/20 bg-gradient-to-br from-yellow-500/10 via-white to-white/95 backdrop-blur-sm shadow-[0_24px_60px_rgba(234,179,8,0.12)]",
  red: "rounded-[28px] border border-red-400/20 bg-gradient-to-br from-red-500/10 via-white to-white/95 backdrop-blur-sm shadow-[0_24px_60px_rgba(225,29,72,0.12)]",
  purple: "rounded-[28px] border border-purple-400/20 bg-gradient-to-br from-purple-500/10 via-white to-white/95 backdrop-blur-sm shadow-[0_24px_60px_rgba(168,85,247,0.12)]",
  slate: "rounded-[28px] border border-slate-400/20 bg-gradient-to-br from-slate-500/10 via-white to-white/95 backdrop-blur-sm shadow-[0_24px_60px_rgba(100,116,139,0.1)]",
};

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
      // Seed both keys: useInsights (primary) and useAnalytics (legacy alias, same data shape).
      queryClient.setQueryData(queryKeys.insights.all, initialInsights);
      queryClient.setQueryData(queryKeys.analytics.all, initialInsights);
    }
  }, [queryClient, initialInsights]);

  const { data, isLoading } = useInsights();

  /**
   * Mount guard: hydrate with skeleton state on first paint, swap to real data
   * after the next animation frame — matches the PatientManagement pattern.
   */
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    requestAnimationFrame(() => setIsMounted(true));
  }, []);

  const loading = !isMounted || isLoading;

  /** Safe-access defaults while loading (values are never rendered — skeletons replace them). */
  const overview = data?.overview;
  const byStatus = data?.byStatus ?? {};
  const byCategory = data?.byCategory ?? {};
  const monthlyData = data?.monthlyData ?? Array.from({ length: 12 }, (_, i) => ({ month: `M${i + 1}`, count: 0 }));
  const topPatients = data?.topPatients ?? [];

  const statCards = [
    { label: "Total", value: overview?.total ?? 0, icon: Activity, color: "text-blue-600", glass: "blue" },
    { label: "Upcoming", value: overview?.upcoming ?? 0, icon: CalendarClock, color: "text-indigo-600", glass: "indigo" },
    { label: "Done", value: overview?.done ?? 0, icon: CalendarCheck, color: "text-green-600", glass: "green" },
    { label: "Pending", value: overview?.pending ?? 0, icon: CalendarClock, color: "text-yellow-600", glass: "yellow" },
    { label: "Overdue", value: overview?.overdue ?? 0, icon: CalendarX, color: "text-red-600", glass: "red" },
    { label: "This Month", value: overview?.thisMonth ?? 0, icon: TrendingUp, color: "text-purple-600", glass: "purple" },
  ];

  const maxMonthly = Math.max(...monthlyData.map((m) => m.count), 1);

  return (
    <div className="space-y-4">
      {/* Heading always static */}
      <div>
        <h1 className="text-xl md:text-2xl font-semibold tracking-tight">Business Analytics</h1>
        <p className="text-muted-foreground text-sm">Track your business performance, patient trends, appointment analytics and more.</p>
      </div>

      {/* ─── Overview stat cards — shells always visible; value pulses while loading ── */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
        {statCards.map((stat) => (
          <Card key={stat.label} className={GLASS[stat.glass]}>
            <CardContent className="pt-5 pb-4">
              <div className="flex items-center gap-2">
                <stat.icon className={`h-5 w-5 shrink-0 ${stat.color}`} />
                {/* Value slot: pulse while loading */}
                {loading ? (
                  <Skeleton className="h-7 w-12 rounded" />
                ) : (
                  <span className="text-xl md:text-2xl text-gray-700 font-semibold">{stat.value}</span>
                )}
              </div>
              {/* Label stays static */}
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* ─── Monthly Trend — card frame + title static; bars pulse ────────────────── */}
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
                    /* Skeleton bar: random-ish height to look like a bar chart */
                    <Skeleton
                      className="w-full rounded-t"
                      style={{ height: `${20 + (idx % 5) * 18}px` }}
                    />
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

        {/* ─── By Category — card frame + title static; rows pulse ─────────────────── */}
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

        {/* ─── By Status — card frame static; counts pulse ─────────────────────────── */}
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

        {/* ─── Top Patients — card frame + table headers static; rows pulse ────────── */}
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
              {/* Table headers always static */}
              <TableHeader>
                <TableRow>
                  <TableHead>Patient</TableHead>
                  <TableHead className="text-right">Visits</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  /* Skeleton rows */
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
    </div>
  );
}
