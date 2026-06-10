/**
 * Doctor entity detail chrome — emerald field tokens (CP) + sky/emerald tone resolver (portal + CP).
 */
import {
  skyGlassBackButtonClass,
  skyGlassTableFrameClass,
  emeraldGlassBackButtonClass,
} from "@/lib/calendar-header-action-styles";
import {
  entityDetailChromeEmeraldIconClass,
  entityDetailChromeEmeraldIconTileClass,
  entityDetailChromeSkyIconClass,
  entityDetailChromeSkyIconTileClass,
} from "@/lib/page-chrome-classes";
import {
  entityDetailActionsRowClass,
  entityDetailFieldIconCircleClass,
  entityDetailSectionIconCircleClass,
} from "@/lib/patient-detail-ui-classes";

/** Emerald tone tokens for CP doctor detail (parity with doctor-management list). */
export const doctorDetailFieldIconCircleClass =
  "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-emerald-200/70 bg-emerald-50/80 shadow-[0_2px_8px_rgba(16,185,129,0.15)]";

export const doctorDetailSectionIconCircleClass =
  "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-emerald-200/70 bg-emerald-50/80 shadow-[0_2px_10px_rgba(16,185,129,0.18)]";

export const doctorDetailCardFrameClass =
  "rounded-[20px] border border-emerald-100/50 bg-white/90 text-gray-700 shadow-[0_14px_48px_-12px_rgba(16,185,129,0.28)]";

export type DoctorDetailTone = "sky" | "emerald";

export type DoctorDetailToneClasses = {
  backButtonClass: string;
  cardFrameClass: string;
  cardBorderClass: string;
  sectionDividerClass: string;
  fieldIconCircleClass: string;
  fieldIconClass: string;
  sectionIconCircleClass: string;
  sectionIconClass: string;
  stickyFooterClass: string;
  chromeIconTileClass: string;
  chromeIconClass: string;
};

/** Resolve tone tokens for shared `DoctorDetailScreenShared`. */
export function resolveDoctorDetailToneClasses(tone: DoctorDetailTone): DoctorDetailToneClasses {
  if (tone === "emerald") {
    return {
      backButtonClass: emeraldGlassBackButtonClass,
      cardFrameClass: doctorDetailCardFrameClass,
      cardBorderClass: "border-emerald-100/50",
      sectionDividerClass: "border-emerald-100/80",
      fieldIconCircleClass: doctorDetailFieldIconCircleClass,
      fieldIconClass: "h-3 w-3 text-emerald-600",
      sectionIconCircleClass: doctorDetailSectionIconCircleClass,
      sectionIconClass: "h-3.5 w-3.5 text-emerald-600",
      stickyFooterClass: entityDetailActionsRowClass,
      chromeIconTileClass: entityDetailChromeEmeraldIconTileClass,
      chromeIconClass: entityDetailChromeEmeraldIconClass,
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
    stickyFooterClass: entityDetailActionsRowClass,
    chromeIconTileClass: entityDetailChromeSkyIconTileClass,
    chromeIconClass: entityDetailChromeSkyIconClass,
  };
}

/** Staff directory for related-appointments portraits (portal + CP doctor detail SSR). */
export const DOCTOR_DETAIL_DOCTOR_USERS_FILTERS = { role: "doctor" as const, limit: 200 };
export const DOCTOR_DETAIL_ADMIN_USERS_FILTERS = { role: "admin" as const, limit: 50 };
