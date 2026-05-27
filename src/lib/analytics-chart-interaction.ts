/**
 * Shared Recharts interaction tokens for /insights analytics charts —
 * tooltips above glass cards, value labels on non-zero points, pie slice config.
 */

import type { CSSProperties } from "react";
import type { ChartConfig } from "@/components/ui/chart";
import { ANALYTICS_CHART_COLORS } from "@/components/shared/analytics/analytics-chart-classes";

/** Above glass chart panels (`Z_SELECT_DROPDOWN`), below fixed navbar (`Z_NAVBAR`). */
export const ANALYTICS_CHART_TOOLTIP_Z_INDEX = 90;

export const analyticsChartTooltipWrapperStyle: CSSProperties = {
  zIndex: ANALYTICS_CHART_TOOLTIP_Z_INDEX,
  pointerEvents: "none",
};

export const analyticsChartTooltipContentClass =
  "z-[90] border-border/60 bg-background/95 shadow-lg backdrop-blur-sm";

/** Extra top inset so value labels are not clipped by the card. */
export const analyticsChartPlotMargin = {
  left: 0,
  right: 8,
  top: 22,
  bottom: 0,
} as const;

/** Centered empty-state overlay on insights chart plot area. */
export const analyticsChartEmptyOverlayClass =
  "pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 bg-background/50 px-3 backdrop-blur-[1px] sm:px-4";

/** Empty-state copy stack — title row then description row, centered in plot. */
export const analyticsChartEmptyCopyStackClass =
  "flex w-full max-w-full flex-col items-center gap-1 text-center";

export const analyticsChartEmptyTitleClass = "text-sm font-medium text-muted-foreground";

/** Description row — full width with normal inline word breaks (not title+desc on one line). */
export const analyticsChartEmptyDescriptionClass =
  "text-xs leading-snug text-muted-foreground/90 [overflow-wrap:anywhere]";

export type AnalyticsChartTooltipCursorVariant =
  | "bar"
  | "line"
  | "area"
  | "pie"
  | "none";

/** Hover affordance per chart geometry — `none` for pie (slice highlight only). */
export function analyticsChartTooltipCursor(
  variant: AnalyticsChartTooltipCursorVariant
): boolean | { fill?: string; stroke?: string; strokeWidth?: number; strokeDasharray?: string } {
  switch (variant) {
    case "bar":
      return { fill: "hsl(var(--muted) / 0.35)" };
    case "line":
    case "area":
      return {
        stroke: "hsl(var(--border))",
        strokeWidth: 1,
        strokeDasharray: "4 4",
      };
    case "pie":
    case "none":
    default:
      return false;
  }
}

export function analyticsChartTooltipProps(variant: AnalyticsChartTooltipCursorVariant): {
  cursor: ReturnType<typeof analyticsChartTooltipCursor>;
  wrapperStyle: CSSProperties;
} {
  return {
    cursor: analyticsChartTooltipCursor(variant),
    wrapperStyle: analyticsChartTooltipWrapperStyle,
  };
}

/** Omit zero/empty values from on-chart labels. */
export function formatAnalyticsChartLabelValue(value: unknown): string | null {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n) || n <= 0) {
    return null;
  }
  return Number.isInteger(n) ? String(n) : n.toLocaleString(undefined, { maximumFractionDigits: 1 });
}

type PieSlice = { name: string };

/**
 * Pie tooltips resolve labels via slice `name` (not a single `count` config key).
 * Also seeds --color-{name} CSS vars for ChartStyle when slices are stable.
 */
export function buildPieChartConfigFromSlices(slices: readonly PieSlice[]): ChartConfig {
  const config: ChartConfig = {
    count: { label: "Count", color: ANALYTICS_CHART_COLORS[0] },
  };
  slices.forEach((slice, index) => {
    const key = slice.name.trim() || `slice-${index}`;
    config[key] = {
      label: slice.name,
      color: ANALYTICS_CHART_COLORS[index % ANALYTICS_CHART_COLORS.length],
    };
  });
  return config;
}
