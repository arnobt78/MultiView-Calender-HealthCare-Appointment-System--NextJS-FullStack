/**
 * Organization entity detail — indigo glass tokens (CP organization-management tab).
 */
import { indigoGlassBackButtonClass } from "@/lib/calendar-header-action-styles";
import {
  entityDetailChromeIndigoIconClass,
  entityDetailChromeIndigoIconTileClass,
} from "@/lib/page-chrome-classes";
import {
  entityDetailFieldIconCircleClass,
  entityDetailSectionIconCircleClass,
  patientDetailDefinitionListClass,
  patientDetailDefinitionRowClass,
  patientDetailSchemaSectionClass,
  patientDetailSnapshotTableFrameClass,
} from "@/lib/patient-detail-ui-classes";

export const organizationDetailBackButtonClass = indigoGlassBackButtonClass;

export const organizationDetailCardFrameClass =
  "rounded-[20px] border border-indigo-100/50 bg-white/90 text-gray-700 shadow-[0_14px_48px_-12px_rgba(99,102,241,0.28)]";

export const organizationDetailCardBorderClass = "border-indigo-100/50";

export const organizationDetailFieldIconCircleClass =
  "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-indigo-200/70 bg-indigo-50/80 shadow-[0_2px_8px_rgba(99,102,241,0.15)]";

export const organizationDetailFieldIconClass = "h-3 w-3 text-indigo-600";

export const organizationDetailSectionIconCircleClass =
  "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-indigo-200/70 bg-indigo-50/80 shadow-[0_2px_10px_rgba(99,102,241,0.18)]";

export const organizationDetailSectionIconClass = "h-3.5 w-3.5 text-indigo-600";

export const organizationDetailDefinitionListClass = patientDetailDefinitionListClass;
export const organizationDetailDefinitionRowClass = patientDetailDefinitionRowClass;
export const organizationDetailSchemaSectionClass = patientDetailSchemaSectionClass;
export const organizationDetailSnapshotTableFrameClass = patientDetailSnapshotTableFrameClass;

export const organizationDetailChromeIconTileClass = entityDetailChromeIndigoIconTileClass;
export const organizationDetailChromeIconClass = entityDetailChromeIndigoIconClass;

/** Re-export for field rows that match patient sky circles when needed. */
export const organizationDetailDefaultFieldIconCircleClass = entityDetailFieldIconCircleClass;
export const organizationDetailDefaultSectionIconCircleClass = entityDetailSectionIconCircleClass;
