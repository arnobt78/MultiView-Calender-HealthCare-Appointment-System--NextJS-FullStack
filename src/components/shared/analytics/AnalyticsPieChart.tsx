"use client";

import dynamic from "next/dynamic";
import { useMemo } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import type { AnalyticsPiePoint } from "@/components/shared/analytics/AnalyticsPieChartInner";
import { buildPieChartConfigFromSlices } from "@/lib/analytics-chart-interaction";

const PieChartInner = dynamic(
  () => import("./AnalyticsPieChartInner").then((m) => m.AnalyticsPieChartInner),
  { ssr: false, loading: () => <Skeleton className="h-48 w-full rounded-xl" /> }
);

type Props = { data: AnalyticsPiePoint[]; loading?: boolean };

export function AnalyticsPieChart({ data, loading }: Props) {
  const chartConfig = useMemo(() => buildPieChartConfigFromSlices(data), [data]);

  if (loading) return <Skeleton className="h-48 w-full rounded-xl" />;
  return <PieChartInner data={data} config={chartConfig} />;
}
