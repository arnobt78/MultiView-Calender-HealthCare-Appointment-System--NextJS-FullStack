"use client";

import { SlidersHorizontal } from "lucide-react";
import { InsightsScopeControls } from "@/components/insights/InsightsScopeControls";
import type { InsightsFilterKey } from "@/lib/insights-scope";
import {
  insightsBareToolbarRowClass,
  insightsInlineControlRowClass,
} from "@/lib/insights-ui-classes";
import type { User } from "@/types/types";
import { toTitleCaseLabel } from "@/lib/utils";

type Props = {
  filter: InsightsFilterKey;
  onFilterChange: (next: InsightsFilterKey) => void;
  viewerRole: string | null;
  disabled?: boolean;
  doctors?: User[];
  doctorsLoading?: boolean;
};

/** Scope-only toolbar — mounts in page chrome; period controls live in Appointments section. */
export function InsightsScopeToolbar({
  filter,
  onFilterChange,
  viewerRole,
  disabled = false,
  doctors,
  doctorsLoading,
}: Props) {
  return (
    <div className={insightsBareToolbarRowClass}>
      <div className={insightsInlineControlRowClass}>
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
