"use client";

import type { PieLabelRenderProps } from "recharts";
import { shouldShowPieSliceLabelLine } from "@/lib/analytics-chart-interaction";

/** Pie slice connector — omitted for dominant slices (avoids stray horizontal line). */
export function AnalyticsPieSliceLabelLine(props: PieLabelRenderProps) {
  const percent = props.percent ?? 0;
  if (!shouldShowPieSliceLabelLine(percent)) {
    return null;
  }

  const points = props.points as { x: number; y: number }[] | undefined;
  if (!points?.length) {
    return null;
  }

  const stroke =
    typeof props.stroke === "string" && props.stroke.length > 0 ? props.stroke : "#64748b";

  return (
    <polyline
      stroke={stroke}
      fill="none"
      strokeWidth={1}
      points={points.map((point: { x: number; y: number }) => `${point.x},${point.y}`).join(" ")}
    />
  );
}
