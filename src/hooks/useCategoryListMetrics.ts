import { useMemo } from "react";
import type { Category } from "@/types/types";
import { isCategoryActive } from "@/lib/entity-active-status";

export type CategoryListMetrics = {
  total: number;
  active: number;
  inactive: number;
  withDuration: number;
};

/** Derived KPI counts from cached `categories` list — no extra HTTP. */
export function useCategoryListMetrics(categories: Category[]): CategoryListMetrics {
  return useMemo(() => {
    let active = 0;
    let inactive = 0;
    let withDuration = 0;
    for (const c of categories) {
      if (isCategoryActive(c)) active++;
      else inactive++;
      if (c.duration_minutes_default != null) withDuration++;
    }
    return {
      total: categories.length,
      active,
      inactive,
      withDuration,
    };
  }, [categories]);
}
