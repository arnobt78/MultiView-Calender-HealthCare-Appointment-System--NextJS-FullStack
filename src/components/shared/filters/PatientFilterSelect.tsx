"use client";

import type { Patient } from "@/types/types";
import { User } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  PatientSelectOption,
  patientSelectItemClass,
} from "@/components/shared/person-display/PatientSelectOption";
import {
  filterSelectIconClass,
  filterSelectTriggerDashboardClass,
} from "@/lib/filter-select-classes";
import { patientSelectSearchText } from "@/lib/patient-select-display";
import { cn } from "@/lib/utils";

const ALL_VALUE = "__all__";

type PatientFilterSelectProps = {
  value: string | null;
  onValueChange: (patientId: string | null) => void;
  patients: Patient[];
  allLabel?: string;
  triggerClassName?: string;
  disabled?: boolean;
};

/** Dashboard client filter — portrait, name, age badge, care tier line (matches booking dialog). */
export function PatientFilterSelect({
  value,
  onValueChange,
  patients,
  allLabel = "All Clients",
  triggerClassName,
  disabled = false,
}: PatientFilterSelectProps) {
  const selected = value ? patients.find((p) => p.id === value) : undefined;

  return (
    <Select
      value={value ?? ALL_VALUE}
      onValueChange={(v) => onValueChange(v === ALL_VALUE ? null : v)}
      disabled={disabled}
    >
      <SelectTrigger
        className={cn(
          filterSelectTriggerDashboardClass,
          "min-w-[200px]",
          selected &&
            "h-11 min-h-[2.75rem] max-h-[2.75rem] overflow-hidden [&_[data-slot=select-value]]:hidden",
          triggerClassName
        )}
        aria-label="Filter by client"
      >
        <User className={filterSelectIconClass} aria-hidden />
        {selected ? (
          <PatientSelectOption patient={selected} compact className="min-w-0 flex-1 pr-1" />
        ) : (
          <SelectValue placeholder={allLabel}>{allLabel}</SelectValue>
        )}
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={ALL_VALUE}>{allLabel}</SelectItem>
        {patients.map((p) => (
          <SelectItem
            key={p.id}
            value={p.id}
            textValue={patientSelectSearchText(p)}
            className={patientSelectItemClass}
          >
            <PatientSelectOption patient={p} />
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
