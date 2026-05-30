"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Category } from "@/types/types";
import { isCategoryActive } from "@/lib/entity-active-status";

export type CategoryStatusFilter = "all" | "active" | "inactive";

type Ctx = {
  status: CategoryStatusFilter;
  setStatus: (s: CategoryStatusFilter) => void;
  filterByStatus: (list: Category[]) => Category[];
};

const CategoryListFiltersContext = createContext<Ctx | null>(null);

export function CategoryListFiltersProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<CategoryStatusFilter>("all");

  const filterByStatus = useCallback(
    (list: Category[]) => {
      if (status === "active") return list.filter((c) => isCategoryActive(c));
      if (status === "inactive") return list.filter((c) => !isCategoryActive(c));
      return list;
    },
    [status]
  );

  const value = useMemo(
    () => ({ status, setStatus, filterByStatus }),
    [status, filterByStatus]
  );

  return (
    <CategoryListFiltersContext.Provider value={value}>
      {children}
    </CategoryListFiltersContext.Provider>
  );
}

export function useCategoryListFilters() {
  const ctx = useContext(CategoryListFiltersContext);
  if (!ctx) {
    throw new Error("useCategoryListFilters requires CategoryListFiltersProvider");
  }
  return ctx;
}
