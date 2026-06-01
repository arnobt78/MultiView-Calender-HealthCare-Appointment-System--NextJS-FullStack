"use client";

import type { Category } from "@/types/types";
import { Tag } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CategorySelectOption } from "@/components/shared/category-display/CategorySelectOption";
import {
  filterSelectIconClass,
  filterSelectTriggerDashboardClass,
} from "@/lib/filter-select-classes";
import { cn } from "@/lib/utils";

const ALL_VALUE = "__all__";

type CategoryFilterSelectProps = {
  value: string | null;
  onValueChange: (categoryId: string | null) => void;
  categories: Category[];
  allLabel?: string;
  triggerClassName?: string;
  disabled?: boolean;
};

/** Dashboard / toolbar category filter — brand mark + label in items and trigger. */
export function CategoryFilterSelect({
  value,
  onValueChange,
  categories,
  allLabel = "All Categories",
  triggerClassName,
  disabled = false,
}: CategoryFilterSelectProps) {
  const selected = value ? categories.find((c) => c.id === value) : undefined;

  return (
    <Select
      value={value ?? ALL_VALUE}
      onValueChange={(v) => onValueChange(v === ALL_VALUE ? null : v)}
      disabled={disabled}
    >
      <SelectTrigger
        className={cn(filterSelectTriggerDashboardClass, "min-w-[180px]", triggerClassName)}
        aria-label="Filter by category"
      >
        <Tag className={filterSelectIconClass} aria-hidden />
        {selected ? (
          <CategorySelectOption category={selected} compact className="min-w-0 flex-1" />
        ) : (
          <SelectValue placeholder={allLabel}>{allLabel}</SelectValue>
        )}
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={ALL_VALUE}>{allLabel}</SelectItem>
        {categories.map((c) => (
          <SelectItem key={c.id} value={c.id} textValue={c.label}>
            <CategorySelectOption category={c} />
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
