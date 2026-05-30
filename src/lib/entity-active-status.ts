import type { Category, Patient } from "@/types/types";

/** Patient list `active` flag — default true when unset. */
export function isPatientActive(patient: Patient): boolean {
  return patient.active !== false;
}

/** Category `is_active` — default true when unset. */
export function isCategoryActive(category: Category): boolean {
  return category.is_active !== false;
}

export type BookingSelectPartition<T> = {
  /** Selectable rows (active + current inactive selection when editing). */
  selectable: T[];
  /** Inactive rows shown disabled at the bottom of booking dropdowns. */
  inactiveDisplay: T[];
};

/**
 * Split entities for appointment booking `<Select>`:
 * active items are selectable; inactive appear below a separator (disabled).
 * When `currentId` points at an inactive row (edit mode), keep it in `selectable`.
 */
export function partitionForBookingSelect<T>({
  items,
  isActive,
  getId,
  currentId,
  sortSelectable,
}: {
  items: T[];
  isActive: (item: T) => boolean;
  getId: (item: T) => string;
  currentId?: string | null;
  sortSelectable?: (a: T, b: T) => number;
}): BookingSelectPartition<T> {
  const selectable: T[] = [];
  const inactiveDisplay: T[] = [];

  for (const item of items) {
    const id = getId(item);
    if (isActive(item)) {
      selectable.push(item);
    } else if (currentId && id === currentId) {
      selectable.push(item);
    } else {
      inactiveDisplay.push(item);
    }
  }

  if (sortSelectable) {
    selectable.sort(sortSelectable);
  }

  return { selectable, inactiveDisplay };
}

/** Categories in booking UI — lower `sort_order` first, then label. */
export function sortCategoriesForBookingSelect(a: Category, b: Category): number {
  const orderA = a.sort_order ?? 0;
  const orderB = b.sort_order ?? 0;
  if (orderA !== orderB) return orderA - orderB;
  return a.label.localeCompare(b.label);
}

/** Patients in booking UI — name ascending. */
export function sortPatientsForBookingSelect(a: Patient, b: Patient): number {
  const nameA = `${a.firstname} ${a.lastname}`.trim();
  const nameB = `${b.firstname} ${b.lastname}`.trim();
  return nameA.localeCompare(nameB);
}
