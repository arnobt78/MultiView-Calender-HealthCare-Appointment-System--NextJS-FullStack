"use client";

import { CalendarRange, SlidersHorizontal } from "lucide-react";
import { InsightsPeriodControls } from "@/components/insights/InsightsPeriodControls";
import { InsightsScopeControls } from "@/components/insights/InsightsScopeControls";
import type { InsightsFilterKey } from "@/lib/insights-scope";
import type { InsightsPeriod } from "@/lib/insights/insights-period";
import {
  insightsFilterToolbarGlassClass,
  insightsSegmentGroupClass,
} from "@/lib/insights-ui-classes";
import type { User } from "@/types/types";
import { toTitleCaseLabel } from "@/lib/utils";

type Props = {
  period: InsightsPeriod;
  onPeriodChange: (next: InsightsPeriod) => void;
  filter: InsightsFilterKey;
  onFilterChange: (next: InsightsFilterKey) => void;
  viewerRole: string | null;
  disabled?: boolean;
  doctors?: User[];
  doctorsLoading?: boolean;
};

/** Glass shell for period + scope controls — mounts in PortalChromeHeader actions. */
export function InsightsFilterToolbar({
  period,
  onPeriodChange,
  filter,
  onFilterChange,
  viewerRole,
  disabled = false,
  doctors,
  doctorsLoading,
}: Props) {
  return (
    <div className={insightsFilterToolbarGlassClass}>
      <div className={insightsSegmentGroupClass}>
        <span className="flex items-center gap-1 px-2 text-[10px] font-semibold uppercase tracking-wide text-sky-600/90">
          <CalendarRange className="h-3.5 w-3.5" aria-hidden />
          {toTitleCaseLabel("Period")}
        </span>
        <InsightsPeriodControls
          period={period}
          onPeriodChange={onPeriodChange}
          disabled={disabled}
        />
      </div>
      <div className={insightsSegmentGroupClass}>
        <span className="flex items-center gap-1 px-2 text-[10px] font-semibold uppercase tracking-wide text-sky-600/90">
          <SlidersHorizontal className="h-3.5 w-3.5" aria-hidden />
          {toTitleCaseLabel("Scope")}
        </span>
        <InsightsScopeControls
          filter={filter}
          onFilterChange={onFilterChange}
          viewerRole={viewerRole}
          disabled={disabled}
          doctors={doctors}
          doctorsLoading={doctorsLoading}
        />
      </div>
    </div>
  );
}
