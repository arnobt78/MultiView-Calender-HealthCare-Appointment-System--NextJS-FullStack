"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";
import type { ChartConfig } from "@/components/ui/chart";
import type { AnalyticsAreaPoint } from "@/components/shared/analytics/AnalyticsAreaChartInner";
import { analyticsChartConfigColor } from "@/components/shared/analytics/analytics-chart-classes";

const chartConfig = {
  count: { label: "Revenue", color: analyticsChartConfigColor(4) },
} satisfies ChartConfig;

const AreaChartInner = dynamic(
  () => import("./AnalyticsAreaChartInner").then((m) => m.AnalyticsAreaChartInner),
  { ssr: false, loading: () => <Skeleton className="h-40 w-full rounded-xl" /> }
);

type Props = { data: AnalyticsAreaPoint[]; loading?: boolean };

export function AnalyticsAreaChart({ data, loading }: Props) {
  if (loading) return <Skeleton className="h-40 w-full rounded-xl" />;
  return <AreaChartInner data={data} config={chartConfig} />;
}
