"use client";

/**
 * Reusable filter dropdown — same Radix `Select` stack as `calendar/Filters.tsx`.
 * Navbar stays visible: `fixed` + `Z_NAVBAR` (see `portal-z-index.ts`).
 */

import type { LucideIcon } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  filterSelectIconClass,
  filterSelectTriggerDashboardClass,
  filterSelectTriggerToolbarClass,
} from "@/lib/filter-select-classes";
import { cn, toTitleCaseLabel } from "@/lib/utils";

export type FilterSelectOption<T extends string = string> = {
  value: T;
  label: string;
};

type FilterSelectProps<T extends string> = {
  value: T;
  onValueChange: (value: T) => void;
  options: readonly FilterSelectOption<T>[];
  /** Shown in trigger (like `Filters` computed labels). */
  displayLabel: string;
  icon?: LucideIcon;
  size?: "dashboard" | "toolbar";
  triggerClassName?: string;
  contentClassName?: string;
  ariaLabel?: string;
  disabled?: boolean;
};

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

  return (
    <Select value={value} onValueChange={onValueChange} disabled={disabled}>
      <SelectTrigger
        className={cn(triggerSizeClass, triggerClassName)}
        aria-label={ariaLabel}
      >
        {Icon ? <Icon className={filterSelectIconClass} aria-hidden /> : null}
        <SelectValue>{displayLabel}</SelectValue>
      </SelectTrigger>
      <SelectContent className={contentClassName}>
        {options.map((opt) => (
          <SelectItem key={opt.value} value={opt.value}>
            {toTitleCaseLabel(opt.label)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
