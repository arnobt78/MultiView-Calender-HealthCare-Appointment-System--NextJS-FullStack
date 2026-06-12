"use client";

import type { LucideIcon } from "lucide-react";
import {
  filterSelectOptionLabelIconClass,
  filterSelectOptionLabelRowClass,
  filterSelectOptionLabelTextClass,
} from "@/lib/filter-select-option-label-classes";
import { cn, toTitleCaseLabel } from "@/lib/utils";

type FilterSelectOptionLabelProps = {
  label: string;
  icon?: LucideIcon;
  iconClassName?: string;
  textClassName?: string;
  className?: string;
};

/** Icon + colored label row — used in FilterSelect trigger and menu items. */
export function FilterSelectOptionLabel({
  label,
  icon: Icon,
  iconClassName,
  textClassName,
  className,
}: FilterSelectOptionLabelProps) {
  return (
    <span className={cn(filterSelectOptionLabelRowClass, className)}>
      {Icon ? (
        <Icon
          className={cn(filterSelectOptionLabelIconClass, iconClassName)}
          aria-hidden
        />
      ) : null}
      <span className={cn(filterSelectOptionLabelTextClass, textClassName)}>
        {toTitleCaseLabel(label)}
      </span>
    </span>
  );
}
