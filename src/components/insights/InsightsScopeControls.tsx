"use client";

/**
 * Insights header scope — doctor segmented toggle; admin org + doctor drill-down select.
 */

import { Building2, Stethoscope, UserRound } from "lucide-react";
import type { User } from "@/types/types";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DoctorSelectOption } from "@/components/shared/doctor-display/DoctorSelectOption";
import { InsightsGlassSegment } from "@/components/insights/InsightsGlassSegment";
import {
  INSIGHTS_ORG_SELECT_VALUE,
  type InsightsFilterKey,
} from "@/lib/insights-scope";
import { isAdminRole, isDoctorRole } from "@/lib/rbac";
import {
  insightsSegmentActiveClass,
  insightsSegmentInactiveClass,
} from "@/lib/insights-ui-classes";
import { cn } from "@/lib/utils";

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
      <div className="flex min-w-0 flex-col items-stretch gap-2 sm:flex-row sm:items-center sm:gap-3">
        <Button
          type="button"
          size="sm"
          variant="ghost"
          title="Organization-wide metrics"
          disabled={disabled}
          className={cn(
            "h-8 gap-1.5 rounded-lg px-2.5 text-xs sm:text-sm",
            isOrg ? insightsSegmentActiveClass : insightsSegmentInactiveClass
          )}
          onClick={() => onFilterChange({ scope: "organization" })}
        >
          <Building2 className="h-3.5 w-3.5 shrink-0" aria-hidden />
          Organization-wide
        </Button>
        <div className="flex min-w-0 items-center gap-2">
          <Label
            htmlFor="insights-doctor-scope"
            className="flex shrink-0 items-center gap-1 text-xs font-medium text-gray-700"
          >
            <Stethoscope className="h-3.5 w-3.5 text-sky-600" aria-hidden />
            By doctor
          </Label>
          <Select
            value={selectValue}
            onValueChange={(value) => {
              if (value === INSIGHTS_ORG_SELECT_VALUE) {
                onFilterChange({ scope: "organization" });
                return;
              }
              onFilterChange({ scope: "personal", doctorId: value });
            }}
            disabled={disabled || doctorsLoading}
          >
            <SelectTrigger
              id="insights-doctor-scope"
              className="h-8 min-w-[200px] max-w-[280px] rounded-lg border-sky-200/80 bg-white/80 text-gray-700 shadow-[0_8px_24px_rgba(2,132,199,0.12)] backdrop-blur-sm"
            >
              <SelectValue placeholder="Select doctor" />
            </SelectTrigger>
            <SelectContent className="max-h-[min(24rem,70vh)]">
              <SelectItem value={INSIGHTS_ORG_SELECT_VALUE}>
                <span className="flex items-center gap-2 text-sm text-gray-700">
                  <Building2 className="h-4 w-4 shrink-0 text-sky-600" aria-hidden />
                  Organization-wide
                </span>
              </SelectItem>
              {doctors.map((doctor) => (
                <SelectItem key={doctor.id} value={doctor.id}>
                  <DoctorSelectOption
                    doctor={{
                      id: doctor.id,
                      display_name: doctor.display_name,
                      email: doctor.email,
                      image: doctor.image,
                      specialty: doctor.specialty,
                    }}
                  />
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    );
  }

  return null;
}
