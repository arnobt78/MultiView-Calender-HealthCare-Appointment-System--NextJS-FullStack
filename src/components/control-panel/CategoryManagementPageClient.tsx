"use client";

import type { Category } from "@/types/types";
import { ControlPanelSectionPageClient } from "@/components/control-panel/ControlPanelSectionPageClient";

type Props = {
  initialCategories: Category[] | null;
};

/** @deprecated Use `ControlPanelSectionServerPage({ tab: "categories" })`. */
export function CategoryManagementPageClient({ initialCategories }: Props) {
  return (
    <ControlPanelSectionPageClient
      tab="categories"
      initial={{ categories: initialCategories }}
    />
  );
}
