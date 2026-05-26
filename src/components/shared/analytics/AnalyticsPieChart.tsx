"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";
import type { ChartConfig } from "@/components/ui/chart";
import type { AnalyticsPiePoint } from "@/components/shared/analytics/AnalyticsPieChartInner";

const chartConfig = {
  count: { label: "Count", color: "hsl(var(--chart-3))" },
} satisfies ChartConfig;

const PieChartInner = dynamic(
  () => import("./AnalyticsPieChartInner").then((m) => m.AnalyticsPieChartInner),
  { ssr: false, loading: () => <Skeleton className="h-48 w-full rounded-xl" /> }
);

type Props = { data: AnalyticsPiePoint[]; loading?: boolean };

export function AnalyticsPieChart({ data, loading }: Props) {
  if (loading) return <Skeleton className="h-48 w-full rounded-xl" />;
  return <PieChartInner data={data} config={chartConfig} />;
}
