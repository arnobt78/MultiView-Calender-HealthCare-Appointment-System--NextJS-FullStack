"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  XAxis,
  YAxis,
  type ChartConfig,
} from "@/components/ui/chart";

export type AnalyticsStackedBarPoint = {
  month: string;
  done: number;
  pending: number;
  alert: number;
};

export function AnalyticsStackedBarChartInner({
  data,
  config,
}: {
  data: AnalyticsStackedBarPoint[];
  config: ChartConfig;
}) {
  return (
    <div className="space-y-3">
      <ChartContainer config={config} className="h-44 min-h-[11rem] w-full">
        <BarChart data={data} margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
          <CartesianGrid vertical={false} strokeDasharray="3 3" />
          <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={10} />
          <YAxis tickLine={false} axisLine={false} fontSize={10} width={32} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Bar dataKey="done" stackId="status" fill="var(--color-done)" radius={[0, 0, 0, 0]} />
          <Bar dataKey="pending" stackId="status" fill="var(--color-pending)" />
          <Bar dataKey="alert" stackId="status" fill="var(--color-alert)" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ChartContainer>
      <div className="flex flex-wrap items-center gap-4 text-[11px] text-muted-foreground">
        <span className="flex items-center gap-1">
          <span className="inline-block h-2.5 w-2.5 rounded-sm bg-emerald-500/80" />
          Done
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-2.5 w-2.5 rounded-sm bg-amber-400/80" />
          Pending
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-2.5 w-2.5 rounded-sm bg-red-400/70" />
          Alert
        </span>
      </div>
    </div>
  );
}
