/**
 * Shared toolbar filter Select triggers — same tokens as `calendar/Filters.tsx` (dashboard list view).
 * Portalled `SelectContent` uses `Z_SELECT_DROPDOWN`; navbar is `fixed` + `Z_NAVBAR` (see `portal-z-index.ts`).
 */

import { cn } from "@/lib/utils";

const filterSelectTriggerBase =
  "w-auto rounded-2xl border-gray-200 bg-white text-gray-700 shadow-sm gap-2";

/** Dashboard appointment list / `GlobalCalendarFilters` — `h-9`. */
export const filterSelectTriggerDashboardClass = cn(
  filterSelectTriggerBase,
  "h-9 min-w-[160px]"
);

/** Doctor portal, CP patient toolbar, long labels — fixed `h-10`. */
export const filterSelectTriggerToolbarClass = cn(
  filterSelectTriggerBase,
  "h-10 max-h-10 min-h-10 shrink-0 min-w-[160px]"
);

/** Inline doctor label inside fixed h-10 triggers — width grows, height stays h-10. */
export const filterSelectTriggerDoctorInlineValueClass = cn(
  "h-10 max-h-10 min-h-10 items-center overflow-hidden py-0",
  "[&_[data-slot=select-value]]:min-w-0 [&_[data-slot=select-value]]:flex-1 [&_[data-slot=select-value]]:overflow-hidden [&_[data-slot=select-value]]:items-center"
);

export const filterSelectIconClass = "h-3.5 w-3.5 shrink-0 text-gray-400";
