"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import type { Category } from "@/types/types";
import type { CategoryListMetrics } from "@/hooks/useCategoryListMetrics";

export type CategoryMetricsContextValue = {
  categories: Category[];
  metrics: CategoryListMetrics;
  isLoading: boolean;
  isFetching: boolean;
  listBodyLoading: boolean;
};

const CategoryMetricsContext = createContext<CategoryMetricsContextValue | null>(null);

export function CategoryMetricsProvider({
  value,
  children,
}: {
  value: CategoryMetricsContextValue;
  children: ReactNode;
}) {
  const memo = useMemo(
    () => ({
      categories: value.categories,
      metrics: value.metrics,
      isLoading: value.isLoading,
      isFetching: value.isFetching,
      listBodyLoading: value.listBodyLoading,
    }),
    [
      value.categories,
      value.metrics,
      value.isLoading,
      value.isFetching,
      value.listBodyLoading,
    ]
  );
  return (
    <CategoryMetricsContext.Provider value={memo}>{children}</CategoryMetricsContext.Provider>
  );
}

export function useCategoryMetricsContext() {
  const ctx = useContext(CategoryMetricsContext);
  if (!ctx) {
    throw new Error("useCategoryMetricsContext requires CategoryMetricsProvider");
  }
  return ctx;
}
