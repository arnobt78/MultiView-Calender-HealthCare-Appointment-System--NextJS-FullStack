"use client";

import { Stethoscope } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  doctorSelectItemClass,
  DoctorSelectOption,
} from "@/components/shared/doctor-display/DoctorSelectOption";
import { DoctorSelectTriggerOption } from "@/components/shared/doctor-display/DoctorSelectTriggerOption";
import {
  doctorSelectSearchText,
  userToDoctorIdentity,
  type DoctorIdentityUserInput,
} from "@/lib/doctor-identity-map";
import {
  filterSelectIconClass,
  filterSelectTriggerDashboardClass,
  filterSelectTriggerDoctorInlineValueClass,
  filterSelectTriggerToolbarClass,
} from "@/lib/filter-select-classes";
import { cn } from "@/lib/utils";

const ALL_VALUE = "all";

type DoctorFilterSelectProps = {
  value: string;
  onValueChange: (doctorId: string) => void;
  doctors: readonly DoctorIdentityUserInput[];
  allLabel?: string;
  size?: "dashboard" | "toolbar";
  triggerClassName?: string;
  disabled?: boolean;
  ariaLabel?: string;
};

/** List-toolbar doctor filter — fixed h-10 trigger with inline avatar/name/badge row. */
export function DoctorFilterSelect({
  value,
  onValueChange,
  doctors,
  allLabel = "All Doctors",
  size = "toolbar",
  triggerClassName,
  disabled = false,
  ariaLabel = "Filter by doctor",
}: DoctorFilterSelectProps) {
  const selected =
    value !== ALL_VALUE ? doctors.find((d) => d.id === value) : undefined;
  const triggerSizeClass =
    size === "toolbar" ? filterSelectTriggerToolbarClass : filterSelectTriggerDashboardClass;

  return (
    <Select
      value={value}
      onValueChange={onValueChange}
      disabled={disabled}
    >
      <SelectTrigger
        className={cn(
          triggerSizeClass,
          size === "toolbar" && filterSelectTriggerDoctorInlineValueClass,
          triggerClassName
        )}
        aria-label={ariaLabel}
      >
        <Stethoscope className={filterSelectIconClass} aria-hidden />
        <SelectValue asChild placeholder={allLabel}>
          {selected ? (
            <DoctorSelectTriggerOption doctor={userToDoctorIdentity(selected)} />
          ) : (
            <span className="truncate text-sm text-gray-700">{allLabel}</span>
          )}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={ALL_VALUE}>{allLabel}</SelectItem>
        {doctors.map((doctor) => (
          <SelectItem
            key={doctor.id}
            value={doctor.id}
            textValue={doctorSelectSearchText(doctor)}
            className={doctorSelectItemClass}
          >
            <DoctorSelectOption doctor={userToDoctorIdentity(doctor)} />
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
