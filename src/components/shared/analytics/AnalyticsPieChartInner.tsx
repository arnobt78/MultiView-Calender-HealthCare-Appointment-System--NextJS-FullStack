"use client";

import {
  Cell,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  Pie,
  PieChart,
  type ChartConfig,
} from "@/components/ui/chart";
import { ANALYTICS_CHART_COLORS } from "@/components/shared/analytics/analytics-chart-classes";

export type AnalyticsPiePoint = { name: string; count: number };

export function AnalyticsPieChartInner({
  data,
  config,
}: {
  data: AnalyticsPiePoint[];
  config: ChartConfig;
}) {
  return (
    <ChartContainer config={config} className="mx-auto h-48 min-h-[12rem] w-full max-w-sm">
      <PieChart>
        <ChartTooltip content={<ChartTooltipContent />} />
        <Pie data={data} dataKey="count" nameKey="name" cx="50%" cy="50%" outerRadius={72}>
          {data.map((_, index) => (
            <Cell key={`cell-${index}`} fill={ANALYTICS_CHART_COLORS[index % ANALYTICS_CHART_COLORS.length]} />
          ))}
        </Pie>
      </PieChart>
    </ChartContainer>
  );
}
