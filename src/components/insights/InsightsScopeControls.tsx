"use client";

/**
 * Insights header scope — doctor segmented toggle; admin org + doctor drill-down select.
 * URL sync handled by parent (AnalyticsPage) via onFilterChange.
 */

import { Stethoscope } from "lucide-react";
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
import {
  INSIGHTS_ORG_SELECT_VALUE,
  type InsightsFilterKey,
} from "@/lib/insights-scope";
import { isAdminRole, isDoctorRole } from "@/lib/rbac";
import { cn } from "@/lib/utils";

type Props = {
  filter: InsightsFilterKey;
  onFilterChange: (next: InsightsFilterKey) => void;
  viewerRole: string | null;
  disabled?: boolean;
  /** Parent fetches once (AnalyticsPage) — avoids duplicate useUsers. */
  doctors?: User[];
  doctorsLoading?: boolean;
};

export function InsightsScopeControls({
  filter,
  onFilterChange,
  viewerRole,
  disabled = false,
  doctors = [],
  doctorsLoading = false,
}: Props) {

  if (isDoctorRole(viewerRole)) {
    const isPersonal = filter.scope === "personal";
    return (
      <div
        className="flex shrink-0 flex-wrap items-center gap-1 rounded-lg border border-slate-200/80 bg-slate-50/80 p-0.5"
        role="group"
        aria-label="Insights scope"
      >
        <Button
          type="button"
          size="sm"
          variant={isPersonal ? "default" : "ghost"}
          className={cn("h-8 px-3 text-xs sm:text-sm", !isPersonal && "text-muted-foreground")}
          disabled={disabled}
          onClick={() => onFilterChange({ scope: "personal" })}
        >
          My practice
        </Button>
        <Button
          type="button"
          size="sm"
          variant={!isPersonal ? "default" : "ghost"}
          className={cn("h-8 px-3 text-xs sm:text-sm", isPersonal && "text-muted-foreground")}
          disabled={disabled}
          onClick={() => onFilterChange({ scope: "organization" })}
        >
          Organization-wide
        </Button>
      </div>
    );
  }

  if (isAdminRole(viewerRole)) {
    const selectValue =
      filter.scope === "personal" && filter.doctorId
        ? filter.doctorId
        : INSIGHTS_ORG_SELECT_VALUE;
    const isOrg = selectValue === INSIGHTS_ORG_SELECT_VALUE;

    return (
      <div className="flex shrink-0 flex-col items-stretch gap-2 sm:flex-row sm:items-center sm:gap-3">
        <Button
          type="button"
          size="sm"
          variant={isOrg ? "default" : "outline"}
          className="h-9 text-xs sm:text-sm"
          disabled={disabled}
          onClick={() => onFilterChange({ scope: "organization" })}
        >
          Organization-wide
        </Button>
        <div className="flex min-w-0 items-center gap-2">
          <Label htmlFor="insights-doctor-scope" className="shrink-0 text-xs text-muted-foreground">
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
              className="h-9 min-w-[200px] max-w-[280px] bg-white"
            >
              <SelectValue placeholder="Select doctor" />
            </SelectTrigger>
            <SelectContent className="max-h-[min(24rem,70vh)]">
              <SelectItem value={INSIGHTS_ORG_SELECT_VALUE}>
                <span className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Stethoscope className="h-4 w-4 shrink-0" aria-hidden />
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
