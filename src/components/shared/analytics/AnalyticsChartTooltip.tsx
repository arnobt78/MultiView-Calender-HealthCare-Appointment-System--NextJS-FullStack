"use client";

import { ChartTooltip, ChartTooltipContent, useChart } from "@/components/ui/chart";
import { cn } from "@/lib/utils";
import {
  analyticsChartTooltipContentClass,
  analyticsChartTooltipProps,
  type AnalyticsChartTooltipCursorVariant,
} from "@/lib/analytics-chart-interaction";

type Props = {
  cursorVariant?: AnalyticsChartTooltipCursorVariant;
};

/** Insights charts — elevated z-index + geometry-specific hover cursor. */
export function AnalyticsChartTooltip({ cursorVariant = "bar" }: Props) {
  const { cursor, wrapperStyle } = analyticsChartTooltipProps(cursorVariant);
  return (
    <ChartTooltip
      cursor={cursor}
      wrapperStyle={wrapperStyle}
      content={<ChartTooltipContent className={analyticsChartTooltipContentClass} />}
    />
  );
}

type PieTooltipPayloadItem = {
  name?: string;
  value?: number;
  color?: string;
  dataKey?: string;
};

/** Pie slices — label by slice `name` (dynamic ChartConfig keys), not generic `count`. */
export function AnalyticsPieChartTooltipContent({
  active,
  payload,
  label,
  className,
}: {
  active?: boolean;
  payload?: PieTooltipPayloadItem[];
  label?: string;
  className?: string;
}) {
  const { config } = useChart();

  if (!active || !payload?.length) {
    return null;
  }

  const item = payload[0];
  const sliceName = String(item?.name ?? label ?? "");
  const itemConfig = config[sliceName] ?? config.count;

  return (
    <div
      className={cn(
        "grid min-w-[8rem] gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs shadow-xl",
        analyticsChartTooltipContentClass,
        className
      )}
    >
      <div className="font-medium">{itemConfig?.label ?? sliceName}</div>
      <div className="flex items-center justify-between gap-4">
        <span className="text-muted-foreground">Count</span>
        <span className="font-mono font-medium tabular-nums text-foreground">{item?.value}</span>
      </div>
    </div>
  );
}

export function AnalyticsPieChartTooltip() {
  const { wrapperStyle } = analyticsChartTooltipProps("pie");
  return (
    <ChartTooltip
      cursor={false}
      wrapperStyle={wrapperStyle}
      content={<AnalyticsPieChartTooltipContent />}
    />
  );
}
