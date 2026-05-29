"use client";

/**
 * Insights header scope — doctor segmented toggle; admin org pill + glass doctor drill-down select.
 */

import { Building2, Stethoscope, UserRound } from "lucide-react";
import type { User } from "@/types/types";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { InsightsDoctorScopeSelect } from "@/components/insights/InsightsDoctorScopeSelect";
import { InsightsGlassSegment } from "@/components/insights/InsightsGlassSegment";
import {
  INSIGHTS_ORG_SELECT_VALUE,
  type InsightsFilterKey,
} from "@/lib/insights-scope";
import { isAdminRole, isDoctorRole } from "@/lib/rbac";
import {
  insightsGlassSegmentButtonBaseClass,
  insightsSegmentActiveClass,
  insightsSegmentInactiveClass,
} from "@/lib/insights-ui-classes";
import { cn, toTitleCaseLabel } from "@/lib/utils";

type Props = {
  filter: InsightsFilterKey;
  onFilterChange: (next: InsightsFilterKey) => void;
  viewerRole: string | null;
  disabled?: boolean;
  doctors?: User[];
  doctorsLoading?: boolean;
};

const DOCTOR_SCOPE_OPTIONS = [
  {
    value: "personal" as const,
    label: "My practice",
    icon: UserRound,
    hint: "Metrics for appointments you own",
  },
  {
    value: "organization" as const,
    label: "Organization-wide",
    icon: Building2,
    hint: "All appointments and revenue in the org",
  },
];

export function InsightsScopeControls({
  filter,
  onFilterChange,
  viewerRole,
  disabled = false,
  doctors = [],
  doctorsLoading = false,
}: Props) {
  if (isDoctorRole(viewerRole)) {
    const scope = filter.scope === "organization" ? "organization" : "personal";
    return (
      <InsightsGlassSegment
        ariaLabel="Insights scope"
        options={DOCTOR_SCOPE_OPTIONS}
        value={scope}
        onChange={(next) =>
          onFilterChange(
            next === "organization" ? { scope: "organization" } : { scope: "personal" }
          )
        }
        disabled={disabled}
      />
    );
  }

  if (isAdminRole(viewerRole)) {
    const selectValue =
      filter.scope === "personal" && filter.doctorId
        ? filter.doctorId
        : INSIGHTS_ORG_SELECT_VALUE;
    const isOrg = selectValue === INSIGHTS_ORG_SELECT_VALUE;

    return (
      <div className="flex min-w-0 flex-col items-stretch gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
        <Button
          type="button"
          size="sm"
          variant="ghost"
          title="Organization-wide metrics"
          disabled={disabled}
          className={cn(
            insightsGlassSegmentButtonBaseClass,
            isOrg ? insightsSegmentActiveClass : insightsSegmentInactiveClass
          )}
          onClick={() => onFilterChange({ scope: "organization" })}
        >
          <Building2 className="h-3.5 w-3.5 shrink-0 opacity-90" aria-hidden />
          {toTitleCaseLabel("Organization-wide")}
        </Button>
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <Label
            htmlFor="insights-doctor-scope"
            className="flex shrink-0 items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-sky-600/90"
          >
            <Stethoscope className="h-3.5 w-3.5" aria-hidden />
            {toTitleCaseLabel("By doctor")}
          </Label>
          <InsightsDoctorScopeSelect
            value={selectValue}
            onValueChange={(value) => {
              if (value === INSIGHTS_ORG_SELECT_VALUE) {
                onFilterChange({ scope: "organization" });
                return;
              }
              onFilterChange({ scope: "personal", doctorId: value });
            }}
            doctors={doctors}
            disabled={disabled || doctorsLoading}
          />
        </div>
      </div>
    );
  }

  return null;
}
