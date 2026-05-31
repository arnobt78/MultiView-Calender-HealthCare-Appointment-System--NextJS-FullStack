import type { CategoryCreateInput } from "@/hooks/useCategories";
import { DEFAULT_CATEGORY_ICON, normalizeCategoryIcon } from "@/lib/category-icon-options";
import type { Category } from "@/types/types";

/** Default create form — `is_active: true` matches API POST default. */
export const EMPTY_CATEGORY_FORM: CategoryCreateInput = {
  label: "",
  description: "",
  color: "#f59e0b",
  icon: DEFAULT_CATEGORY_ICON,
  is_active: true,
  sort_order: 0,
  duration_minutes_default: undefined,
};

/** Map persisted category → dialog form state for edit. */
export function categoryToFormInput(category: Category): CategoryCreateInput {
  return {
    label: category.label,
    description: category.description ?? "",
    color: category.color ?? "#f59e0b",
    icon: normalizeCategoryIcon(category.icon),
    is_active: category.is_active !== false,
    sort_order: category.sort_order ?? 0,
    duration_minutes_default: category.duration_minutes_default ?? undefined,
  };
}

/**
 * Normalize dialog form → API payload.
 * Sends explicit `null` for cleared default duration so PUT clears the DB column (omitted keys are no-ops).
 */
export function buildCategorySubmitPayload(form: CategoryCreateInput) {
  const durationRaw = form.duration_minutes_default;
  const duration_minutes_default =
    typeof durationRaw === "number" && !Number.isNaN(durationRaw) ? durationRaw : null;

  return {
    ...form,
    label: form.label.trim(),
    description: form.description?.trim() || undefined,
    icon: normalizeCategoryIcon(form.icon),
    duration_minutes_default,
  };
}
