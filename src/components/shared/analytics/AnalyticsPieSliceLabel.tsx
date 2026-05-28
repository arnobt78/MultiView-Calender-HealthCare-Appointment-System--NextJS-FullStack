"use client";

import type { PieLabelRenderProps } from "recharts";
import { formatAnalyticsChartLabelValue } from "@/lib/analytics-chart-interaction";

/**
 * External pie slice labels — text fill matches slice color (`fill` from Recharts).
 */
export function AnalyticsPieSliceLabel({
  cx = 0,
  cy = 0,
  midAngle = 0,
  outerRadius = 0,
  name,
  value,
  percent,
  fill,
}: PieLabelRenderProps) {
  const countLabel = formatAnalyticsChartLabelValue(value);
  if (!countLabel) {
    return null;
  }

  const sliceFill = typeof fill === "string" && fill.length > 0 ? fill : "#334155";
  const pct = Math.round((percent ?? 0) * 100);
  const displayName = String(name ?? "").trim();
  const text =
    pct >= 1 && displayName ? `${displayName} ${pct}%` : countLabel;

  const RADIAN = Math.PI / 180;
  const radius = Number(outerRadius) + 16;
  const x = Number(cx) + radius * Math.cos(-midAngle * RADIAN);
  const y = Number(cy) + radius * Math.sin(-midAngle * RADIAN);
  const anchor = x > Number(cx) ? "start" : "end";

  return (
    <text
      x={x}
      y={y}
      fill={sliceFill}
      textAnchor={anchor}
      dominantBaseline="central"
      fontSize={10}
      fontWeight={600}
    >
      {text}
    </text>
  );
}
