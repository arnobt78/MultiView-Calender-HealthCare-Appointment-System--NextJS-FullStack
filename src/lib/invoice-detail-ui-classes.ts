/**
 * Invoice detail — violet glass entity detail (billing purple tone, parity with CP appointment violet).
 */
import { violetGlassBackButtonClass } from "@/lib/calendar-header-action-styles";
import {
  entityDetailChromeVioletIconClass,
  entityDetailChromeVioletIconTileClass,
} from "@/lib/page-chrome-classes";
import {
  entityDetailActionsRowClass,
  entityDetailSnapshotSectionShellClass,
  patientDetailDefinitionListClass,
  patientDetailDefinitionRowClass,
} from "@/lib/patient-detail-ui-classes";

/** Violet card frame — shared by invoice definition card, linked visit, and payment table. */
export const invoiceDetailCardFrameClass =
  "rounded-[20px] border border-violet-100/50 bg-white/90 text-gray-700 shadow-[0_14px_48px_-12px_rgba(139,92,246,0.28)]";

export const invoiceDetailCardBorderClass = "border-violet-100/50";

export const invoiceDetailBackButtonClass = violetGlassBackButtonClass;
export const invoiceDetailDefinitionListClass = patientDetailDefinitionListClass;
export const invoiceDetailDefinitionRowClass = patientDetailDefinitionRowClass;
export const invoiceDetailActionsRowClass = entityDetailActionsRowClass;
export const invoiceDetailSnapshotSectionClass = entityDetailSnapshotSectionShellClass.replace(
  "border-sky-100/80",
  "border-violet-100/80"
);

export const invoiceDetailFieldIconCircleClass =
  "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-violet-200/70 bg-violet-50/80 shadow-[0_2px_8px_rgba(139,92,246,0.15)]";

export const invoiceDetailFieldIconClass = "h-3 w-3 text-violet-600";

export const invoiceDetailSectionIconCircleClass =
  "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-violet-200/70 bg-violet-50/80 shadow-[0_2px_10px_rgba(139,92,246,0.18)]";

export const invoiceDetailSectionIconClass = "h-3.5 w-3.5 text-violet-600";

export const invoiceDetailAuditIconCircleClass = invoiceDetailFieldIconCircleClass;

export const invoiceDetailChromeIconTileClass = entityDetailChromeVioletIconTileClass;
export const invoiceDetailChromeIconClass = entityDetailChromeVioletIconClass;

/** Payment history table outer glow — matches invoice violet cards. */
export const invoiceDetailTableFrameClass = invoiceDetailCardFrameClass;

/** Header action cluster beside Back on invoice detail chrome. */
export const invoiceDetailHeaderActionsClass = "flex flex-wrap items-center justify-end gap-2";
