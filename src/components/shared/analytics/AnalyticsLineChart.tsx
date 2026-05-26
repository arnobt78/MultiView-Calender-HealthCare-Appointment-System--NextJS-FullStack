"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";
import type { ChartConfig } from "@/components/ui/chart";

export type AnalyticsLinePoint = { label: string; count: number };

const chartConfig = {
  count: { label: "Count", color: "hsl(var(--chart-1))" },
} satisfies ChartConfig;

const LineChartInner = dynamic(
  () => import("./AnalyticsLineChartInner").then((m) => m.AnalyticsLineChartInner),
  {
    ssr: false,
    loading: () => <Skeleton className="h-40 w-full rounded-xl" />,
  }
);

type Props = {
  data: AnalyticsLinePoint[];
  loading?: boolean;
};

export function AnalyticsLineChart({ data, loading }: Props) {
  if (loading) {
    return <Skeleton className="h-40 w-full rounded-xl" />;
  }
  return <LineChartInner data={data} config={chartConfig} />;
}
