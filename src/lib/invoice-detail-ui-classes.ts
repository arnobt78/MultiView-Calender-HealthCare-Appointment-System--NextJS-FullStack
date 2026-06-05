/**
 * Invoice detail — amber glass entity detail (parity with CP patient/category detail).
 */
import { amberGlassTableFrameClass } from "@/lib/category-management-toolbar-classes";
import { amberGlassBackButtonClass } from "@/lib/calendar-header-action-styles";
import {
  entityDetailChromeAmberIconClass,
  entityDetailChromeAmberIconTileClass,
} from "@/lib/page-chrome-classes";
import {
  entityDetailActionsRowClass,
  entityDetailSnapshotSectionShellClass,
  patientDetailDefinitionListClass,
  patientDetailDefinitionRowClass,
} from "@/lib/patient-detail-ui-classes";

export const invoiceDetailBackButtonClass = amberGlassBackButtonClass;
export const invoiceDetailCardFrameClass = amberGlassTableFrameClass;
export const invoiceDetailDefinitionListClass = patientDetailDefinitionListClass;
export const invoiceDetailDefinitionRowClass = patientDetailDefinitionRowClass;
export const invoiceDetailActionsRowClass = entityDetailActionsRowClass;
export const invoiceDetailSnapshotSectionClass = entityDetailSnapshotSectionShellClass.replace(
  "border-sky-100/80",
  "border-amber-100/80"
);

export const invoiceDetailFieldIconCircleClass =
  "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-amber-200/70 bg-amber-50/80 shadow-[0_2px_8px_rgba(245,158,11,0.15)]";

export const invoiceDetailSectionIconCircleClass =
  "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-amber-200/70 bg-amber-50/80 shadow-[0_2px_10px_rgba(245,158,11,0.18)]";

export const invoiceDetailAuditIconCircleClass = invoiceDetailFieldIconCircleClass;

export const invoiceDetailChromeIconTileClass = entityDetailChromeAmberIconTileClass;
export const invoiceDetailChromeIconClass = entityDetailChromeAmberIconClass;

/** Payment history table outer glow — matches CP invoice list. */
export const invoiceDetailTableFrameClass = amberGlassTableFrameClass;
