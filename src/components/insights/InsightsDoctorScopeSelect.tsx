"use client";

/**
 * Admin insights scope — glass pill Select for org-wide vs per-doctor drill-down.
 * Trigger uses `SelectValue asChild` + inline `DoctorSelectTriggerOption` (no duplicate item text).
 */

import { Building2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DoctorSelectOption } from "@/components/shared/doctor-display/DoctorSelectOption";
import { DoctorSelectTriggerOption } from "@/components/shared/doctor-display/DoctorSelectTriggerOption";
import { INSIGHTS_ORG_SELECT_VALUE } from "@/lib/insights-scope";
import { insightsGlassSelectTriggerClass } from "@/lib/insights-ui-classes";
import { cn } from "@/lib/utils";
import type { User } from "@/types/types";

type Props = {
  id?: string;
  value: string;
  onValueChange: (value: string) => void;
  doctors: User[];
  disabled?: boolean;
  className?: string;
};

function toDoctorIdentity(doctor: User) {
  return {
    id: doctor.id,
    display_name: doctor.display_name,
    email: doctor.email,
    image: doctor.image,
    specialty: doctor.specialty,
  };
}

export function InsightsDoctorScopeSelect({
  id = "insights-doctor-scope",
  value,
  onValueChange,
  doctors,
  disabled = false,
  className,
}: Props) {
  const selectedDoctor = doctors.find((doctor) => doctor.id === value);
  const isOrg = value === INSIGHTS_ORG_SELECT_VALUE;

  return (
    <Select value={value} onValueChange={onValueChange} disabled={disabled}>
      <SelectTrigger
        id={id}
        className={cn(
          insightsGlassSelectTriggerClass,
          "items-center overflow-hidden py-0 [&_[data-slot=select-value]]:max-h-8 [&_[data-slot=select-value]]:overflow-hidden",
          className
        )}
        aria-label="Insights doctor scope"
      >
        <SelectValue asChild placeholder="Select doctor">
          {isOrg ? (
            <span className="flex min-w-0 items-center gap-2 overflow-hidden">
              <Building2 className="h-3.5 w-3.5 shrink-0 text-sky-600" aria-hidden />
              <span className="truncate text-xs text-gray-700">Organization-wide</span>
            </span>
          ) : selectedDoctor ? (
            <DoctorSelectTriggerOption doctor={toDoctorIdentity(selectedDoctor)} />
          ) : (
            <span className="truncate text-xs text-gray-500">Select doctor</span>
          )}
        </SelectValue>
      </SelectTrigger>
      <SelectContent className="max-h-[min(24rem,70vh)]">
        <SelectItem value={INSIGHTS_ORG_SELECT_VALUE}>
          <span className="flex items-center gap-2 text-sm text-gray-700">
            <Building2 className="h-4 w-4 shrink-0 text-sky-600" aria-hidden />
            Organization-wide
          </span>
        </SelectItem>
        {doctors.map((doctor) => (
          <SelectItem key={doctor.id} value={doctor.id} textValue={doctor.display_name?.trim() || doctor.email}>
            <DoctorSelectOption doctor={toDoctorIdentity(doctor)} />
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
