/**
 * Shared period segment options — InsightsPeriodControls + Appointments panel header.
 */

import { Calendar, CalendarDays, CalendarRange, CalendarClock, History } from "lucide-react";
import type { InsightsGlassSegmentOption } from "@/components/insights/InsightsGlassSegment";
import type { InsightsPeriod } from "@/lib/insights/insights-period";

export const INSIGHTS_PERIOD_SEGMENT_OPTIONS = [
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
  {
    value: "all" as const,
    label: "All time",
    icon: History,
    hint: "All appointments in scope — past, present, and scheduled future",
  },
] satisfies InsightsGlassSegmentOption<InsightsPeriod>[];
