"use client";

import { Bar, BarChart, CartesianGrid, YAxis } from "recharts";
import type { ChartConfig } from "@/components/ui/chart";
import { AnalyticsChartEmptyOverlay } from "@/components/shared/analytics/AnalyticsChartEmptyOverlay";
import { AnalyticsChartShell } from "@/components/shared/analytics/AnalyticsChartShell";
import { analyticsChartSlopedXAxisEl } from "@/components/shared/analytics/AnalyticsChartSlopedXAxis";
import { analyticsChartTooltipEl } from "@/components/shared/analytics/AnalyticsChartTooltip";
import { AnalyticsStackedTotalLabel } from "@/components/shared/analytics/AnalyticsStackedTotalLabel";
import type { AnalyticsChartEmptyCopy } from "@/lib/analytics-chart-empty";
import {
  analyticsChartCartesianPropsDense,
  analyticsChartCartesianHeightClass,
} from "@/lib/analytics-chart-interaction";
import { cn } from "@/lib/utils";

export type AnalyticsStackedBarPoint = {
  month: string;
  done: number;
  pending: number;
  alert: number;
};

export function AnalyticsStackedBarChartInner({
  data,
  config,
  emptyCopy,
}: {
  data: AnalyticsStackedBarPoint[];
  config: ChartConfig;
  emptyCopy?: AnalyticsChartEmptyCopy;
}) {
  const doneName = String(config.done?.label ?? "Done");
  const pendingName = String(config.pending?.label ?? "Pending");
  const alertName = String(config.alert?.label ?? "Alert");

  return (
    <div className="space-y-3">
      <div className={cn("relative w-full overflow-visible", analyticsChartCartesianHeightClass)}>
        <AnalyticsChartShell config={config}>
          <BarChart data={data} {...analyticsChartCartesianPropsDense}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            {analyticsChartSlopedXAxisEl("month")}
            <YAxis tickLine={false} axisLine={false} fontSize={10} width={32} />
            {analyticsChartTooltipEl("bar", { config })}
            <Bar
              dataKey="done"
              name={doneName}
              stackId="status"
              fill="var(--color-done)"
              radius={[0, 0, 0, 0]}
              isAnimationActive={false}
            />
            <Bar
              dataKey="pending"
              name={pendingName}
              stackId="status"
              fill="var(--color-pending)"
              isAnimationActive={false}
            />
            <Bar
              dataKey="alert"
              name={alertName}
              stackId="status"
              fill="var(--color-alert)"
              radius={[4, 4, 0, 0]}
              isAnimationActive={false}
              label={(props: Record<string, unknown>) => {
                const row = data[props.index as number];
                if (!row) {
                  return <g />;
                }
                const total = (row.done ?? 0) + (row.pending ?? 0) + (row.alert ?? 0);
                return (
                  <AnalyticsStackedTotalLabel
                    x={props.x as number}
                    y={props.y as number}
                    width={props.width as number}
                    total={total}
                  />
                );
              }}
            />
          </BarChart>
        </AnalyticsChartShell>
        {emptyCopy ? <AnalyticsChartEmptyOverlay copy={emptyCopy} /> : null}
      </div>
      <div className="flex w-full flex-wrap items-center justify-center gap-4 text-[11px] text-muted-foreground">
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
