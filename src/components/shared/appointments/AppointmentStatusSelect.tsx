"use client";

/**
 * Appointment create/edit status picker — icon + colored labels aligned with dashboard filter row.
 * Create mode shows Cancelled as disabled; edit mode allows selecting Cancelled.
 */

import { useMemo } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FilterSelectOptionLabel } from "@/components/shared/filters/FilterSelectOptionLabel";
import { appointmentDialogStatusSelectOptions } from "@/lib/filter-select-option-presets";
import { cn, toTitleCaseLabel } from "@/lib/utils";

type AppointmentStatusSelectProps = {
  value: string;
  onValueChange: (value: string) => void;
  mode: "create" | "edit";
  triggerClassName?: string;
  ariaLabel?: string;
};

export function AppointmentStatusSelect({
  value,
  onValueChange,
  mode,
  triggerClassName,
  ariaLabel = "Select status",
}: AppointmentStatusSelectProps) {
  const options = useMemo(() => appointmentDialogStatusSelectOptions(mode), [mode]);
  const selectedOption = options.find((o) => o.value === value);
  const richSelected = selectedOption?.icon != null;

  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className={triggerClassName} aria-label={ariaLabel}>
        {richSelected && selectedOption ? (
          <FilterSelectOptionLabel
            label={selectedOption.label}
            icon={selectedOption.icon}
            iconClassName={selectedOption.iconClassName}
            textClassName={selectedOption.textClassName}
            className="min-w-0 flex-1"
          />
        ) : (
          <SelectValue placeholder={toTitleCaseLabel("Select Status")} />
        )}
      </SelectTrigger>
      <SelectContent>
        {options.map((opt) => (
          <SelectItem
            key={opt.value}
            value={opt.value}
            disabled={opt.disabled}
            textValue={opt.label}
            className={cn(opt.disabled && "opacity-50")}
          >
            {opt.icon ? (
              <FilterSelectOptionLabel
                label={opt.label}
                icon={opt.icon}
                iconClassName={opt.iconClassName}
                textClassName={opt.textClassName}
              />
            ) : (
              toTitleCaseLabel(opt.label)
            )}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
