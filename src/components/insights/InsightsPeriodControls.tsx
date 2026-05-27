"use client";

/**
 * Insights period segmented control — day / week / month / year; URL sync via parent.
 */

import { InsightsGlassSegment } from "@/components/insights/InsightsGlassSegment";
import { INSIGHTS_PERIOD_SEGMENT_OPTIONS } from "@/components/insights/insights-period-options";
import type { InsightsPeriod } from "@/lib/insights/insights-period";

type Props = {
  period: InsightsPeriod;
  onPeriodChange: (next: InsightsPeriod) => void;
  disabled?: boolean;
};

export function InsightsPeriodControls({ period, onPeriodChange, disabled = false }: Props) {
  return (
    <InsightsGlassSegment
      ariaLabel="Insights period"
      options={INSIGHTS_PERIOD_SEGMENT_OPTIONS}
      value={period}
      onChange={onPeriodChange}
      disabled={disabled}
    />
  );
}
