"use client";

/**
 * Appointments panel chrome — glass stat badges + period segmented control (replaces title/count/subtitle row).
 */

import { BarChart3, LayoutGrid } from "lucide-react";
import { CalendarGlassStatBadge } from "@/components/shared/CalendarGlassStatBadge";
import { InsightsGlassSegment } from "@/components/insights/InsightsGlassSegment";
import { INSIGHTS_PERIOD_SEGMENT_OPTIONS } from "@/components/insights/insights-period-options";
import type { InsightsPeriod } from "@/lib/insights/insights-period";
import {
  insightsAppointmentsToolbarClass,
  insightsInlineControlRowClass,
  insightsScopeHintClass,
} from "@/lib/insights-ui-classes";
import { toTitleCaseLabel } from "@/lib/utils";

type Props = {
  overall: number;
  untilToday: number;
  upcoming: number;
  period: InsightsPeriod;
  onPeriodChange: (next: InsightsPeriod) => void;
  disabled?: boolean;
  loading?: boolean;
  /** My practice, organization-wide, or selected doctor — sky accent beside title. */
  scopeLabel: string;
};

export function InsightsAppointmentsPanelHeader({
  overall,
  untilToday,
  upcoming,
  period,
  onPeriodChange,
  disabled = false,
  loading = false,
  scopeLabel,
}: Props) {
  return (
    <div className={insightsAppointmentsToolbarClass}>
      <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
        <span
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-sky-100 bg-sky-50 text-sky-600"
          aria-hidden
        >
          <BarChart3 className="h-4 w-4" />
        </span>
        <span className="flex min-w-0 flex-wrap items-baseline gap-x-1 text-sm font-semibold text-gray-700">
          <span>{toTitleCaseLabel("Appointments")}</span>
          <span className={insightsScopeHintClass} aria-label={`Scope: ${scopeLabel}`}>
            · {scopeLabel}
          </span>
        </span>
        <CalendarGlassStatBadge label="Overall" value={overall} variant="sky" loading={loading} />
        <CalendarGlassStatBadge
          label="Until today"
          value={untilToday}
          variant="slate"
          loading={loading}
        />
        <CalendarGlassStatBadge
          label="Upcoming"
          value={upcoming}
          variant="violet"
          loading={loading}
        />
      </div>
      <div className={insightsInlineControlRowClass}>
        <span className="flex items-center gap-1 px-2 text-[10px] font-semibold uppercase tracking-wide text-sky-600/90">
          <LayoutGrid className="h-3.5 w-3.5 shrink-0" aria-hidden />
          {toTitleCaseLabel("View as")}
        </span>
        <InsightsGlassSegment
          ariaLabel="Insights chart period"
          options={INSIGHTS_PERIOD_SEGMENT_OPTIONS}
          value={period}
          onChange={onPeriodChange}
          disabled={disabled}
        />
      </div>
    </div>
  );
}
