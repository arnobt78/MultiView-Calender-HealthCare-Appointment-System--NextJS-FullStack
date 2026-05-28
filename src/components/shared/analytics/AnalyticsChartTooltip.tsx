"use client";

import type { ReactElement } from "react";
import { Tooltip } from "recharts";
import type { ChartConfig } from "@/components/ui/chart";
import {
  ANALYTICS_CHART_TOOLTIP_Z_INDEX,
  analyticsChartTooltipCursor,
  formatAnalyticsChartTooltipValue,
  resolveAnalyticsTooltipBucketLabel,
  resolveAnalyticsTooltipSeriesLabel,
  type AnalyticsChartTooltipCursorVariant,
  type AnalyticsChartValueKind,
} from "@/lib/analytics-chart-interaction";

export type AnalyticsChartTooltipOptions = {
  valueKind?: AnalyticsChartValueKind;
  config?: ChartConfig;
};

type TooltipPayloadItem = {
  name?: string | number;
  value?: number;
  color?: string;
  fill?: string;
  dataKey?: string | number;
  payload?: {
    label?: string;
    month?: string;
    name?: string;
    payload?: { name?: string };
  };
};

const TOOLTIP_PANEL_STYLE = {
  backgroundColor: "#ffffff",
  border: "1px solid #e2e8f0",
  borderRadius: 8,
  fontSize: 12,
  boxShadow: "0 4px 12px rgba(15, 23, 42, 0.12)",
  zIndex: ANALYTICS_CHART_TOOLTIP_Z_INDEX,
  padding: "8px 10px",
  pointerEvents: "none" as const,
};

function seriesColor(item: TooltipPayloadItem): string {
  if (typeof item.color === "string" && item.color.length > 0) {
    return item.color;
  }
  if (typeof item.fill === "string" && item.fill.length > 0) {
    return item.fill;
  }
  return "#0f766e";
}

function AnalyticsCartesianTooltipPanel({
  active,
  payload,
  label,
  config,
  valueKind = "count",
}: {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string | number;
  config?: ChartConfig;
  valueKind?: AnalyticsChartValueKind;
}) {
  if (!active || !payload?.length) {
    return null;
  }

  const bucketLabel = resolveAnalyticsTooltipBucketLabel(label, payload);
  const rows = payload.filter((item) => item.value != null);

  return (
    <div style={TOOLTIP_PANEL_STYLE}>
      {bucketLabel ? (
        <div style={{ fontWeight: 600, color: "#0f172a", marginBottom: 6 }}>{bucketLabel}</div>
      ) : null}
      {rows.map((item, index) => {
        const key = String(item.dataKey ?? item.name ?? index);
        const seriesLabel = resolveAnalyticsTooltipSeriesLabel(
          item.dataKey,
          item.name,
          config,
          item.payload?.name ?? item.payload?.payload?.name ?? bucketLabel ?? undefined
        );
        const formatted = formatAnalyticsChartTooltipValue(item.value, valueKind);
        const color = seriesColor(item);
        return (
          <div
            key={key}
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: 16,
              marginTop: index === 0 ? 0 : 4,
            }}
          >
            <span style={{ color: "#64748b" }}>{seriesLabel}</span>
            <span style={{ fontWeight: 600, color, fontVariantNumeric: "tabular-nums" }}>
              {formatted}
            </span>
          </div>
        );
      })}
    </div>
  );
}

/**
 * Returns a <Tooltip> element directly — Recharts checks child.type === Tooltip internally.
 * Use as {analyticsChartTooltipEl("bar", { config })} in chart JSX.
 */
export function analyticsChartTooltipEl(
  cursorVariant: AnalyticsChartTooltipCursorVariant = "bar",
  options: AnalyticsChartTooltipOptions = {}
): ReactElement {
  const { valueKind = "count", config } = options;

  return (
    <Tooltip
      cursor={analyticsChartTooltipCursor(cursorVariant)}
      isAnimationActive={false}
      allowEscapeViewBox={{ x: true, y: true }}
      content={(props) => (
        <AnalyticsCartesianTooltipPanel
          active={props.active}
          payload={props.payload as TooltipPayloadItem[] | undefined}
          label={props.label}
          config={config}
          valueKind={valueKind}
        />
      )}
    />
  );
}

/** Pie slice hover — slice name from nameKey + config slice keys. */
export function analyticsPieChartTooltipEl(options: AnalyticsChartTooltipOptions = {}): ReactElement {
  const { config, valueKind = "count" } = options;

  return (
    <Tooltip
      isAnimationActive={false}
      allowEscapeViewBox={{ x: true, y: true }}
      content={(props) => (
        <AnalyticsCartesianTooltipPanel
          active={props.active}
          payload={props.payload as TooltipPayloadItem[] | undefined}
          label={props.label}
          config={config}
          valueKind={valueKind}
        />
      )}
    />
  );
}

/** @deprecated Use {analyticsChartTooltipEl("bar", opts)} inline. */
export function AnalyticsChartTooltip({
  cursorVariant = "bar",
  valueKind = "count",
  config,
}: {
  cursorVariant?: AnalyticsChartTooltipCursorVariant;
  valueKind?: AnalyticsChartValueKind;
  config?: ChartConfig;
}) {
  return analyticsChartTooltipEl(cursorVariant, { valueKind, config });
}

/** @deprecated Use {analyticsPieChartTooltipEl(opts)} inline. */
export function AnalyticsPieChartTooltip({ config }: { config?: ChartConfig } = {}) {
  return analyticsPieChartTooltipEl({ config });
}
