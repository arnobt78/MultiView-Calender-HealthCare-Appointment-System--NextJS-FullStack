"use client";

import type { ReactElement } from "react";
import { XAxis } from "recharts";
import {
  analyticsChartAxisTickStyle,
  analyticsChartSlopedXAxisHeight,
  analyticsChartSlopedXAxisWrapHeight,
  wrapCategoryAxisLabel,
  type AnalyticsChartXAxisLayout,
} from "@/lib/analytics-chart-interaction";

type CategoryTickProps = {
  x?: number;
  y?: number;
  payload?: { value?: string | number };
};

/**
 * Horizontal multi-line tick — word-wraps long labels (categories, doctor names, date ranges)
 * into up to 3 centered lines. Short labels (dates, weekdays) stay on 1 line with no wrap.
 * Used for ALL insights chart XAxis so every chart shares the same tick style.
 */
function renderHorizontalWrappedTick({ x = 0, y = 0, payload }: CategoryTickProps) {
  const lines = wrapCategoryAxisLabel(
    payload?.value != null ? String(payload.value) : "",
    12, // chars-per-line — short labels fit in 1 line, long labels wrap to 2-3
    3
  );
  const lineHeight = analyticsChartAxisTickStyle.lineHeight;

  return (
    <g transform={`translate(${x},${y})`}>
      <text
        x={0}
        y={0}
        textAnchor="middle"
        fill={analyticsChartAxisTickStyle.fill}
        fontSize={analyticsChartAxisTickStyle.fontSize}
      >
        {lines.map((line, index) => (
          // dy=4 on first tspan = small margin from axis line; subsequent tspans advance by lineHeight
          <tspan key={`${line}-${index}`} x={0} dy={index === 0 ? 4 : lineHeight}>
            {line}
          </tspan>
        ))}
      </text>
    </g>
  );
}

/**
 * Returns a <XAxis> element directly — Recharts checks child.type === XAxis internally.
 * Both layouts now use horizontal word-wrap ticks for visual consistency across all charts.
 * `wrap` reserves a taller band to accommodate long labels that span 2–3 lines.
 */
export function analyticsChartSlopedXAxisEl(
  dataKey: string,
  layout: AnalyticsChartXAxisLayout = "sloped"
): ReactElement {
  return (
    <XAxis
      dataKey={dataKey}
      tickLine={false}
      axisLine={false}
      height={layout === "wrap" ? analyticsChartSlopedXAxisWrapHeight : analyticsChartSlopedXAxisHeight}
      interval={0}
      tick={renderHorizontalWrappedTick}
    />
  );
}

/** @deprecated Use {analyticsChartSlopedXAxisEl("key", layout)} inline. */
export function AnalyticsChartSlopedXAxis({
  dataKey,
  layout = "sloped",
}: {
  dataKey: string;
  layout?: AnalyticsChartXAxisLayout;
}) {
  return analyticsChartSlopedXAxisEl(dataKey, layout);
}
