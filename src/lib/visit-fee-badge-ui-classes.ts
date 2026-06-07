/**
 * Visit-fee + visit-type badge size tokens — sibling chips in the same row must share height.
 * Pair `VisitFeeBadge` `size` with the matching type chip class in each surface.
 */

/** Emerald fee chip on appointment cards — mirrors `AppointmentTypeGlassBadge` metrics (span, not glass). */
export const visitFeeBadgeCardMetaClass =
  "inline-flex max-w-full min-w-0 items-center gap-1 rounded-full border border-emerald-200/70 bg-emerald-50/80 px-2 py-0.5 text-[10px] font-normal text-emerald-700 shadow-[0_2px_8px_rgba(16,185,129,0.15)] leading-none";

/** Patient booking wizard steps 2–3 + picker tiles — pairs with sky `calendar-glass-badge`. */
export const visitFeeBadgeWizardClass =
  "text-xs py-0 leading-none h-auto min-h-0 font-normal";

/** Doctor settings / types table rows — compact like `InvoiceStatusBadge`. */
export const visitFeeBadgeTableClass = "text-[10px] py-0 leading-none h-auto min-h-0";

/** Services catalog cards. */
export const visitFeeBadgeServicesClass = visitFeeBadgeTableClass;

export const visitFeeBadgeSizeClass = {
  cardMeta: visitFeeBadgeCardMetaClass,
  wizard: visitFeeBadgeWizardClass,
  picker: visitFeeBadgeWizardClass,
  table: visitFeeBadgeTableClass,
  services: visitFeeBadgeServicesClass,
} as const;

export type VisitFeeBadgeSize = keyof typeof visitFeeBadgeSizeClass;

/** Sky visit-type chip — same row as `VisitFeeBadge` size `wizard` / `picker`. */
export const bookingWizardTypeBadgeClass =
  "gap-1 text-xs calendar-glass-badge-sky py-0 leading-none h-auto min-h-0 font-normal";
