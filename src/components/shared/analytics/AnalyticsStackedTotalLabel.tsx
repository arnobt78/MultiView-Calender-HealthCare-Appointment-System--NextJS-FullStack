"use client";

import type { ReactElement } from "react";
import {
  analyticsChartLabelStyle,
  formatAnalyticsChartLabelValue,
} from "@/lib/analytics-chart-interaction";

type Props = {
  x?: number;
  y?: number;
  width?: number;
  /** Pre-computed sum of all stacked segments — passed from parent closure via data[index]. */
  total: number;
};

/**
 * Total count above the topmost stack segment (status-over-time).
 * Rendered only on the "alert" Bar (always topmost in stack), whose y = top of the entire stack
 * even when alert=0 (0-height bar sits at cumulative done+pending position).
 * Parent must precompute total from data[index] and pass it — do NOT rely on Recharts payload
 * (stacked bars pass value:[base,top] range, not the original data row).
 */
export function AnalyticsStackedTotalLabel({ x, y, width, total }: Props): ReactElement | null {
  if (x == null || y == null || total <= 0) {
    return null;
  }

  const text = formatAnalyticsChartLabelValue(total);
  if (!text) {
    return null;
  }

  const barWidth = width != null ? Number(width) : 0;
  const cx = barWidth > 0 ? Number(x) + barWidth / 2 : Number(x);

  return (
    <text
      x={cx}
      y={Math.max(Number(y) - 6, 4)}
      textAnchor="middle"
      fill={analyticsChartLabelStyle.fill}
      fontSize={analyticsChartLabelStyle.fontSize}
      fontWeight={analyticsChartLabelStyle.fontWeight}
    >
      {text}
    </text>
  );
}
