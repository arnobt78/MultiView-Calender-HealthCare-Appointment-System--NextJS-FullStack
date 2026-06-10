/**
 * Appointment entity detail chrome — sky (portal) + violet (CP) glass tokens.
 */
import {
  skyGlassBackButtonClass,
  skyGlassTableFrameClass,
  violetGlassBackButtonClass,
} from "@/lib/calendar-header-action-styles";
import {
  entityDetailChromeSkyIconClass,
  entityDetailChromeSkyIconTileClass,
  entityDetailChromeVioletIconClass,
  entityDetailChromeVioletIconTileClass,
} from "@/lib/page-chrome-classes";
import {
  entityDetailActionsRowClass,
  entityDetailFieldIconCircleClass,
  entityDetailSectionIconCircleClass,
  patientDetailDefinitionListClass,
  patientDetailDefinitionRowClass,
  patientDetailSchemaSectionClass,
  patientDetailSnapshotTableFrameClass,
} from "@/lib/patient-detail-ui-classes";

export type AppointmentDetailTone = "sky" | "violet";

export type AppointmentDetailToneClasses = {
  backButtonClass: string;
  cardFrameClass: string;
  cardBorderClass: string;
  sectionDividerClass: string;
  fieldIconCircleClass: string;
  fieldIconClass: string;
  sectionIconCircleClass: string;
  sectionIconClass: string;
  stickyFooterClass: string;
  durationBadgeClass: string;
  snapshotTableFrameClass: string;
  definitionListClass: string;
  definitionRowClass: string;
  schemaSectionClass: string;
  chromeIconTileClass: string;
  chromeIconClass: string;
};

const VIOLET_CARD =
  "rounded-[20px] border border-violet-100/50 bg-white/90 text-gray-700 shadow-[0_14px_48px_-12px_rgba(139,92,246,0.28)]";

const VIOLET_FIELD_ICON =
  "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-violet-200/70 bg-violet-50/80 shadow-[0_2px_8px_rgba(139,92,246,0.15)]";

const VIOLET_SECTION_ICON =
  "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-violet-200/70 bg-violet-50/80 shadow-[0_2px_10px_rgba(139,92,246,0.18)]";

/** Resolve tone tokens for `AppointmentDetailScreenShared`. */
export function resolveAppointmentDetailToneClasses(
  tone: AppointmentDetailTone
): AppointmentDetailToneClasses {
  if (tone === "violet") {
    return {
      backButtonClass: violetGlassBackButtonClass,
      cardFrameClass: VIOLET_CARD,
      cardBorderClass: "border-violet-100/50",
      sectionDividerClass: "border-violet-100/80",
      fieldIconCircleClass: VIOLET_FIELD_ICON,
      fieldIconClass: "h-3 w-3 text-violet-600",
      sectionIconCircleClass: VIOLET_SECTION_ICON,
      sectionIconClass: "h-3.5 w-3.5 text-violet-600",
      stickyFooterClass: entityDetailActionsRowClass,
      durationBadgeClass:
        "border-violet-200 bg-violet-50 text-xs font-normal text-violet-800",
      snapshotTableFrameClass: patientDetailSnapshotTableFrameClass,
      definitionListClass: patientDetailDefinitionListClass,
      definitionRowClass: patientDetailDefinitionRowClass,
      schemaSectionClass: patientDetailSchemaSectionClass,
      chromeIconTileClass: entityDetailChromeVioletIconTileClass,
      chromeIconClass: entityDetailChromeVioletIconClass,
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
    durationBadgeClass: "border-sky-200 bg-sky-50 text-xs font-normal text-sky-800",
    snapshotTableFrameClass: patientDetailSnapshotTableFrameClass,
    definitionListClass: patientDetailDefinitionListClass,
    definitionRowClass: patientDetailDefinitionRowClass,
    schemaSectionClass: patientDetailSchemaSectionClass,
    chromeIconTileClass: entityDetailChromeSkyIconTileClass,
    chromeIconClass: entityDetailChromeSkyIconClass,
  };
}

export const APPOINTMENT_DETAIL_DOCTOR_USERS_FILTERS = { role: "doctor" as const, limit: 200 };
export const APPOINTMENT_DETAIL_ADMIN_USERS_FILTERS = { role: "admin" as const, limit: 50 };
