"use client";

import type { Category } from "@/types/types";
import { CategoryBrandMark } from "@/components/shared/category-display/CategoryBrandMark";
import { cn } from "@/lib/utils";

type CategorySelectOptionProps = {
  category: Pick<Category, "label" | "color" | "icon">;
  className?: string;
  /** Compact row for dashboard filter trigger (`h-9`). */
  compact?: boolean;
};

/** Category dropdown row — color icon tile + label (dialog + dashboard filters). */
export function CategorySelectOption({
  category,
  className,
  compact = false,
}: CategorySelectOptionProps) {
  return (
    <span
      className={cn(
        "flex min-w-0 items-center gap-2 text-left",
        compact ? "py-0" : "py-0.5",
        className
      )}
    >
      <CategoryBrandMark
        color={category.color}
        icon={category.icon}
        size={compact ? "compact" : "list"}
      />
      <span
        className={cn(
          "truncate font-medium text-gray-700",
          compact ? "text-xs" : "text-sm"
        )}
      >
        {category.label}
      </span>
    </span>
  );
}
