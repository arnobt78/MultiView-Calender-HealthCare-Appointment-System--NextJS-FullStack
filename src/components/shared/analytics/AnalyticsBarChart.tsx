"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";
import type { ChartConfig } from "@/components/ui/chart";
import type { AnalyticsBarPoint } from "@/components/shared/analytics/AnalyticsBarChartInner";

const chartConfig = {
  count: { label: "Count", color: "hsl(var(--chart-2))" },
} satisfies ChartConfig;

const BarChartInner = dynamic(
  () => import("./AnalyticsBarChartInner").then((m) => m.AnalyticsBarChartInner),
  { ssr: false, loading: () => <Skeleton className="h-40 w-full rounded-xl" /> }
);

type Props = { data: AnalyticsBarPoint[]; loading?: boolean };

export function AnalyticsBarChart({ data, loading }: Props) {
  if (loading) return <Skeleton className="h-40 w-full rounded-xl" />;
  return <BarChartInner data={data} config={chartConfig} />;
}
