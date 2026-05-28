"use client";

import type { ReactElement } from "react";
import { XAxis } from "recharts";
import {
  ANALYTICS_X_AXIS_STAGGER_THRESHOLD,
  analyticsChartAxisTickStyle,
  analyticsChartSlopedXAxisHeight,
  analyticsChartSlopedXAxisWrapHeight,
  wrapCategoryAxisLabel,
  type AnalyticsChartXAxisLayout,
} from "@/lib/analytics-chart-interaction";

type CategoryTickProps = {
  x?: number;
  y?: number;
  /** Recharts passes the zero-based tick index — used to stagger dense series into two rows. */
  index?: number;
  payload?: { value?: string | number };
};

/**
 * above-below mode (line/area charts): even ticks float above the axis line into the chart's
 * bottom margin buffer; odd ticks sit below in the XAxis band. Bars are not present so SVG
 * z-order doesn't matter.
 *
 * two-row-below mode (bar/stacked-bar): BOTH rows below the axis so bar rects (rendered earlier
 * in SVG order) never obscure the labels. Near row just below axis, far row further down.
 */
const TICK_DY_ABOVE = -12;      // above-below even:  baseline 12px above axis
const TICK_DY_BELOW = 10;       // above-below odd:   baseline 10px below axis
const TICK_DY_NEAR_BELOW = 5;   // two-row-below even: baseline 5px below axis (first row)
const TICK_DY_FAR_BELOW = 19;   // two-row-below odd:  baseline 19px below axis (second row)

/**
 * Returns a Recharts-compatible custom tick renderer.
 *
 * `stagger=false`: all ticks at single row dy=4 (sparse series ≤10 points).
 * `stagger=true, staggerAbove=true`: even ticks above axis (dy=-12), odd below (dy=10).
 *   Use for line/area — no bars cover the above-axis labels.
 * `stagger=true, staggerAbove=false`: even ticks near-below (dy=5), odd far-below (dy=19).
 *   Use for bar/stacked-bar — both rows below axis so bar rects never obscure labels.
 */
function makeCategoryTickRenderer(stagger: boolean, staggerAbove: boolean) {
  return function renderTick({ x = 0, y = 0, index = 0, payload }: CategoryTickProps) {
    const lines = wrapCategoryAxisLabel(
      payload?.value != null ? String(payload.value) : "",
      12, // chars-per-line — short date/time labels stay 1 line; long names wrap to 2-3
      3
    );
    const lineHeight = analyticsChartAxisTickStyle.lineHeight as number;
    let dy0 = 4; // default: single row, no stagger
    if (stagger) {
      if (staggerAbove) {
        // line/area: even above axis, odd below axis
        dy0 = index % 2 === 0 ? TICK_DY_ABOVE : TICK_DY_BELOW;
      } else {
        // bar/stacked-bar: both rows below axis (bars don't cover them)
        dy0 = index % 2 === 0 ? TICK_DY_NEAR_BELOW : TICK_DY_FAR_BELOW;
      }
    }

    return (
      <g transform={`translate(${x},${y})`}>
        <text
          x={0}
          y={0}
          textAnchor="middle"
          fill={analyticsChartAxisTickStyle.fill}
          fontSize={analyticsChartAxisTickStyle.fontSize}
        >
          {lines.map((line, i) => (
            // First tspan uses the row dy; subsequent lines advance by lineHeight within same tick
            <tspan key={`${line}-${i}`} x={0} dy={i === 0 ? dy0 : lineHeight}>
              {line}
            </tspan>
          ))}
        </text>
      </g>
    );
  };
}

/**
 * Returns a <XAxis> element directly — Recharts checks child.type === XAxis internally.
 *
 * Both "sloped" and "wrap" layouts use horizontal ticks for visual consistency.
 * When `dataLength > ANALYTICS_X_AXIS_STAGGER_THRESHOLD` and layout is "sloped":
 *   - `staggerAbove=true`  (default, line/area): even ticks above axis, odd below.
 *   - `staggerAbove=false` (bar/stacked-bar):    both rows below axis so bars don't cover labels.
 * Wrap-layout charts (doctor names / categories) are never staggered (labels are multi-line).
 *
 * XAxis band height=40 fits both stagger modes: far-below row ends at ~21px, well within band.
 */
export function analyticsChartSlopedXAxisEl(
  dataKey: string,
  layout: AnalyticsChartXAxisLayout = "sloped",
  dataLength = 0,
  staggerAbove = true
): ReactElement {
  const stagger = layout !== "wrap" && dataLength > ANALYTICS_X_AXIS_STAGGER_THRESHOLD;
  const bandHeight = layout === "wrap" ? analyticsChartSlopedXAxisWrapHeight : analyticsChartSlopedXAxisHeight;

  return (
    <XAxis
      dataKey={dataKey}
      tickLine={false}
      axisLine={false}
      height={bandHeight}
      interval={0}
      tick={makeCategoryTickRenderer(stagger, staggerAbove)}
    />
  );
}

/** @deprecated Use {analyticsChartSlopedXAxisEl("key", layout, data.length, staggerAbove)} inline. */
export function AnalyticsChartSlopedXAxis({
  dataKey,
  layout = "sloped",
  dataLength = 0,
  staggerAbove = true,
}: {
  dataKey: string;
  layout?: AnalyticsChartXAxisLayout;
  dataLength?: number;
  staggerAbove?: boolean;
}) {
  return analyticsChartSlopedXAxisEl(dataKey, layout, dataLength, staggerAbove);
}
