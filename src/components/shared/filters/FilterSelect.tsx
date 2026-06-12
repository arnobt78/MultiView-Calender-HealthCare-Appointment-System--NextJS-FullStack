"use client";

/**
 * Reusable filter dropdown — same Radix `Select` stack as `calendar/Filters.tsx`.
 * Rich options (icon + text color per row) via `filter-select-option-presets.ts`.
 */

import type { LucideIcon } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FilterSelectOptionLabel } from "@/components/shared/filters/FilterSelectOptionLabel";
import {
  filterSelectIconClass,
  filterSelectTriggerDashboardClass,
  filterSelectTriggerToolbarClass,
} from "@/lib/filter-select-classes";
import { cn, toTitleCaseLabel } from "@/lib/utils";

export type FilterSelectOption<T extends string = string> = {
  value: T;
  label: string;
  icon?: LucideIcon;
  iconClassName?: string;
  textClassName?: string;
};

type FilterSelectProps<T extends string> = {
  value: T;
  onValueChange: (value: T) => void;
  options: readonly FilterSelectOption<T>[];
  /** Shown in trigger when selected option has no rich metadata. */
  displayLabel: string;
  icon?: LucideIcon;
  size?: "dashboard" | "toolbar";
  triggerClassName?: string;
  contentClassName?: string;
  ariaLabel?: string;
  disabled?: boolean;
};

function optionIsRich<T extends string>(opt: FilterSelectOption<T>): boolean {
  return opt.icon != null;
}

export function FilterSelect<T extends string>({
  value,
  onValueChange,
  options,
  displayLabel,
  icon: Icon,
  size = "dashboard",
  triggerClassName,
  contentClassName,
  ariaLabel,
  disabled = false,
}: FilterSelectProps<T>) {
  const triggerSizeClass =
    size === "toolbar" ? filterSelectTriggerToolbarClass : filterSelectTriggerDashboardClass;

  const selectedOption = options.find((o) => o.value === value);
  const richSelected = selectedOption && optionIsRich(selectedOption);

  return (
    <Select value={value} onValueChange={onValueChange} disabled={disabled}>
      <SelectTrigger
        className={cn(triggerSizeClass, triggerClassName)}
        aria-label={ariaLabel}
      >
        {richSelected ? (
          <FilterSelectOptionLabel
            label={selectedOption.label}
            icon={selectedOption.icon}
            iconClassName={selectedOption.iconClassName}
            textClassName={selectedOption.textClassName}
            className="min-w-0 flex-1"
          />
        ) : (
          <>
            {Icon ? <Icon className={filterSelectIconClass} aria-hidden /> : null}
            <SelectValue>{displayLabel}</SelectValue>
          </>
        )}
      </SelectTrigger>
      <SelectContent className={contentClassName}>
        {options.map((opt) => (
          <SelectItem key={opt.value} value={opt.value} textValue={opt.label}>
            {optionIsRich(opt) ? (
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
