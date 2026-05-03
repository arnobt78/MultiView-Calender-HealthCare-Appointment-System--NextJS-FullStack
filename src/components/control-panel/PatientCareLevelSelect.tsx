"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PATIENT_CARE_LEVEL_STAGES } from "@/lib/patient-care-level";
import { cn } from "@/lib/utils";

/** Shared 1–10 acuity picker — persists numeric `care_level` on Patient create/update APIs. */
export function PatientCareLevelSelect({
  value,
  onValueChange,
  id,
  className,
  disabled,
  "aria-label": ariaLabel,
}: {
  value: number | undefined | null;
  onValueChange: (next: number | undefined) => void;
  id?: string;
  className?: string;
  disabled?: boolean;
  "aria-label"?: string;
}) {
  const v = value != null && value >= 1 && value <= 10 ? String(value) : "none";
  return (
    <Select
      value={v}
      disabled={disabled}
      onValueChange={(s) => onValueChange(s === "none" ? undefined : Number(s))}
    >
      <SelectTrigger
        id={id}
        className={cn("w-full min-w-0 rounded-2xl border-gray-200", className)}
        aria-label={ariaLabel}
      >
        <SelectValue placeholder="Not Set" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="none">Not Set</SelectItem>
        {PATIENT_CARE_LEVEL_STAGES.map((stage) => (
          <SelectItem key={stage.value} value={String(stage.value)} title={stage.detail}>
            {`${stage.value} — ${stage.shortLabel}`}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
