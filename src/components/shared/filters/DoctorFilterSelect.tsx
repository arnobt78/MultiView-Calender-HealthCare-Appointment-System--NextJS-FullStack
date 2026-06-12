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

/** List-toolbar doctor filter — avatar + specialty in trigger and menu (PatientFilterSelect parity). */
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
          "min-w-[200px]",
          selected &&
            "max-h-10 overflow-hidden [&_[data-slot=select-value]]:hidden",
          triggerClassName
        )}
        aria-label={ariaLabel}
      >
        <Stethoscope className={filterSelectIconClass} aria-hidden />
        {selected ? (
          <span className="min-w-0 flex-1 overflow-hidden">
            <DoctorSelectTriggerOption doctor={userToDoctorIdentity(selected)} />
          </span>
        ) : (
          <SelectValue placeholder={allLabel}>{allLabel}</SelectValue>
        )}
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
