"use client";

import { useInsights } from "@/hooks/useInsights";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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

export default function AnalyticsPage() {
  const { data, isLoading } = useInsights();

  if (isLoading) {
    return (
      <div className="py-8">
        <h1 className="text-2xl font-bold mb-6">Insights</h1>
        <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="pt-6">
                <div className="h-8 bg-muted rounded w-12 mb-2" />
                <div className="h-4 bg-muted rounded w-20" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { overview, byStatus, byCategory, monthlyData, topPatients } = data;

  const statCards = [
    { label: "Total", value: overview.total, icon: Activity, color: "text-blue-600" },
    { label: "Upcoming", value: overview.upcoming, icon: CalendarClock, color: "text-indigo-600" },
    { label: "Done", value: overview.done, icon: CalendarCheck, color: "text-green-600" },
    { label: "Pending", value: overview.pending, icon: CalendarClock, color: "text-yellow-600" },
    { label: "Overdue", value: overview.overdue, icon: CalendarX, color: "text-red-600" },
    { label: "This Month", value: overview.thisMonth, icon: TrendingUp, color: "text-purple-600" },
  ];

  // Simple bar chart using CSS
  const maxMonthly = Math.max(...monthlyData.map((m) => m.count), 1);

  return (
    <div className="space-y-8 py-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Insights</h1>
        <p className="text-muted-foreground">Appointment statistics</p>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
        {statCards.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
                <span className="text-2xl font-bold">{stat.value}</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Monthly Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Monthly Appointments</CardTitle>
            <CardDescription>Last 12 months</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-1 h-40">
              {monthlyData.map((m) => (
                <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
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
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* By Category */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">By Category</CardTitle>
            <CardDescription>Distribution across categories</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(byCategory)
                .sort(([, a], [, b]) => b - a)
                .map(([cat, count]) => {
                  const pct = Math.round((count / overview.total) * 100);
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
          </CardContent>
        </Card>

        {/* By Status */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">By Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {Object.entries(byStatus).map(([status, count]) => (
                <div key={status} className="flex items-center gap-2">
                  <Badge
                    variant={
                      status === "done"
                        ? "default"
                        : status === "pending"
                          ? "secondary"
                          : "outline"
                    }
                  >
                    {status}
                  </Badge>
                  <span className="text-lg font-semibold">{count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Patients */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="h-5 w-5" />
              Top Patients
            </CardTitle>
            <CardDescription>By visit frequency</CardDescription>
          </CardHeader>
          <CardContent>
            {topPatients.length === 0 ? (
              <p className="text-sm text-muted-foreground">No patient data available</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Patient</TableHead>
                    <TableHead className="text-right">Visits</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topPatients.map((p, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="font-medium">{p.name}</TableCell>
                      <TableCell className="text-right">
                        <Badge variant="secondary">{p.count}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
