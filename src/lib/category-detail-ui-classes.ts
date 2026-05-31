/**
 * Category entity detail chrome — sky (CP patient parity) vs amber (portal category routes).
 */
import {
  amberGlassTableFrameClass,
} from "@/lib/category-management-toolbar-classes";
import {
  amberGlassBackButtonClass,
  skyGlassBackButtonClass,
  skyGlassTableFrameClass,
} from "@/lib/calendar-header-action-styles";
import {
  entityDetailFieldIconCircleClass,
  entityDetailSectionIconCircleClass,
  patientDetailStickyFooterClass,
} from "@/lib/patient-detail-ui-classes";

export type CategoryDetailTone = "sky" | "amber";

export type CategoryDetailToneClasses = {
  backButtonClass: string;
  cardFrameClass: string;
  cardBorderClass: string;
  sectionDividerClass: string;
  fieldIconCircleClass: string;
  fieldIconClass: string;
  sectionIconCircleClass: string;
  sectionIconClass: string;
  durationBadgeClass: string;
  stickyFooterClass: string;
};

const AMBER_FIELD_ICON_CIRCLE =
  "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-amber-200/70 bg-amber-50/80 shadow-[0_2px_8px_rgba(245,158,11,0.15)]";

const AMBER_SECTION_ICON_CIRCLE =
  "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-amber-200/70 bg-amber-50/80 shadow-[0_2px_10px_rgba(245,158,11,0.18)]";

/** Amber sticky footer — same rhythm as patient detail, category portal glow. */
export const categoryDetailStickyFooterClassAmber =
  "sticky bottom-0 z-10 -mx-2 min-h-[3.25rem] border-t border-amber-100/60 bg-white/95 px-2 py-3 text-gray-700 backdrop-blur supports-backdrop-filter:bg-white/85 sm:-mx-4 sm:px-4 lg:-mx-8 lg:px-8";

/** Resolve tone tokens for shared `CategoryDetailScreenShared`. */
export function resolveCategoryDetailToneClasses(
  tone: CategoryDetailTone
): CategoryDetailToneClasses {
  if (tone === "amber") {
    return {
      backButtonClass: amberGlassBackButtonClass,
      cardFrameClass: amberGlassTableFrameClass,
      cardBorderClass: "border-amber-100/50",
      sectionDividerClass: "border-amber-100/80",
      fieldIconCircleClass: AMBER_FIELD_ICON_CIRCLE,
      fieldIconClass: "h-3 w-3 text-amber-600",
      sectionIconCircleClass: AMBER_SECTION_ICON_CIRCLE,
      sectionIconClass: "h-3.5 w-3.5 text-amber-600",
      durationBadgeClass:
        "border-amber-200/80 bg-amber-50/90 text-xs font-normal text-gray-700",
      stickyFooterClass: categoryDetailStickyFooterClassAmber,
    };
  }
  return {
    backButtonClass: skyGlassBackButtonClass,
    cardFrameClass: skyGlassTableFrameClass,
    cardBorderClass: "border-sky-100/50",
    sectionDividerClass: "border-sky-100/80",
    fieldIconCircleClass: entityDetailFieldIconCircleClass,
    fieldIconClass: "h-3 w-3 text-sky-600",
    sectionIconCircleClass: entityDetailSectionIconCircleClass,
    sectionIconClass: "h-3.5 w-3.5 text-sky-600",
    durationBadgeClass: "border-sky-200/80 bg-sky-50/90 text-xs font-normal text-gray-700",
    stickyFooterClass: patientDetailStickyFooterClass,
  };
}

/** Shared filters — category detail appointment table staff portraits (CP + portal SSR/hover). */
export const CATEGORY_DETAIL_DOCTOR_USERS_FILTERS = { role: "doctor" as const, limit: 200 };
export const CATEGORY_DETAIL_ADMIN_USERS_FILTERS = { role: "admin" as const, limit: 50 };
