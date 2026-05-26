"use client";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  Line,
  LineChart,
  XAxis,
  YAxis,
  CartesianGrid,
  type ChartConfig,
} from "@/components/ui/chart";
import type { AnalyticsLinePoint } from "@/components/shared/analytics/AnalyticsLineChart";

export function AnalyticsLineChartInner({
  data,
  config,
}: {
  data: AnalyticsLinePoint[];
  config: ChartConfig;
}) {
  return (
    <ChartContainer config={config} className="h-40 min-h-[10rem] w-full">
      <LineChart data={data} margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={10} />
        <YAxis tickLine={false} axisLine={false} fontSize={10} width={32} />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Line
          type="monotone"
          dataKey="count"
          stroke="var(--color-count)"
          strokeWidth={2}
          dot={{ r: 3 }}
        />
      </LineChart>
    </ChartContainer>
  );
}
