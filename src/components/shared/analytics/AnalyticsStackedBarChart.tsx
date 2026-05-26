"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";
import type { ChartConfig } from "@/components/ui/chart";
import type { AnalyticsStackedBarPoint } from "@/components/shared/analytics/AnalyticsStackedBarChartInner";

const chartConfig = {
  done: { label: "Done", color: "hsl(142 71% 45%)" },
  pending: { label: "Pending", color: "hsl(38 92% 50%)" },
  alert: { label: "Alert", color: "hsl(0 84% 60%)" },
} satisfies ChartConfig;

const StackedInner = dynamic(
  () =>
    import("./AnalyticsStackedBarChartInner").then((m) => m.AnalyticsStackedBarChartInner),
  { ssr: false, loading: () => <Skeleton className="h-44 w-full rounded-xl" /> }
);

type Props = { data: AnalyticsStackedBarPoint[]; loading?: boolean };

export function AnalyticsStackedBarChart({ data, loading }: Props) {
  if (loading) return <Skeleton className="h-44 w-full rounded-xl" />;
  return <StackedInner data={data} config={chartConfig} />;
}
