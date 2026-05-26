"use client";

/**
 * Insights period segmented control — day / week / month / year; URL sync via parent.
 */

import { Calendar, CalendarDays, CalendarRange, CalendarClock } from "lucide-react";
import { InsightsGlassSegment } from "@/components/insights/InsightsGlassSegment";
import type { InsightsPeriod } from "@/lib/insights/insights-period";

const PERIOD_OPTIONS = [
  {
    value: "day" as const,
    label: "Day",
    icon: CalendarDays,
    hint: "Hourly volume for today",
  },
  {
    value: "week" as const,
    label: "Week",
    icon: CalendarRange,
    hint: "Daily volume for this week",
  },
  {
    value: "month" as const,
    label: "Month",
    icon: Calendar,
    hint: "Trend for the selected calendar month",
  },
  {
    value: "year" as const,
    label: "Year",
    icon: CalendarClock,
    hint: "Monthly buckets for the current year",
  },
] satisfies Array<{
  value: InsightsPeriod;
  label: string;
  icon: typeof Calendar;
  hint: string;
}>;

type Props = {
  period: InsightsPeriod;
  onPeriodChange: (next: InsightsPeriod) => void;
  disabled?: boolean;
};

export function InsightsPeriodControls({ period, onPeriodChange, disabled = false }: Props) {
  return (
    <InsightsGlassSegment
      ariaLabel="Insights period"
      options={PERIOD_OPTIONS}
      value={period}
      onChange={onPeriodChange}
      disabled={disabled}
    />
  );
}
