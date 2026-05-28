"use client";

import { LabelList } from "recharts";
import {
  analyticsChartLabelStyle,
  formatAnalyticsChartLabelValue,
  type AnalyticsChartValueKind,
} from "@/lib/analytics-chart-interaction";

type LabelListPosition =
  | "top"
  | "left"
  | "right"
  | "bottom"
  | "inside"
  | "outside"
  | "insideLeft"
  | "insideRight"
  | "insideTop"
  | "insideBottom"
  | "insideTopLeft"
  | "insideBottomLeft"
  | "insideTopRight"
  | "insideBottomRight"
  | "insideStart"
  | "insideEnd"
  | "end"
  | "center";

type Props = {
  dataKey: string;
  position?: LabelListPosition;
  className?: string;
  offset?: number;
  valueKind?: AnalyticsChartValueKind;
  formatter?: (value: unknown, entry?: unknown) => string;
};

/** On-chart values for bar/line/area — inline SVG style (Tailwind fill often missing on Recharts text). */
export function AnalyticsChartValueLabelList({
  dataKey,
  position = "top",
  className,
  offset = 8,
  formatter,
}: Props) {
  return (
    <LabelList
      dataKey={dataKey}
      position={position}
      offset={offset}
      className={className}
      style={analyticsChartLabelStyle}
      formatter={(value: unknown, entry: unknown) =>
        formatter
          ? formatter(value, entry)
          : (formatAnalyticsChartLabelValue(value) ?? "")
      }
    />
  );
}
