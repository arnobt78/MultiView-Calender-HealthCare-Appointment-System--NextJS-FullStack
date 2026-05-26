"use client";

import { LabelList } from "recharts";
import { formatAnalyticsChartLabelValue } from "@/lib/analytics-chart-interaction";

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
};

/** Renders numeric value above/on series when count > 0 — shared across insights charts. */
export function AnalyticsChartValueLabelList({
  dataKey,
  position = "top",
  className = "fill-foreground text-[10px] font-semibold",
}: Props) {
  return (
    <LabelList
      dataKey={dataKey}
      position={position}
      className={className}
      formatter={(value: unknown) => formatAnalyticsChartLabelValue(value) ?? ""}
    />
  );
}
