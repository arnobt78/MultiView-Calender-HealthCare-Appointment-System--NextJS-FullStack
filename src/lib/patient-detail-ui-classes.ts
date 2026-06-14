/**
 * Patient detail definition list — label + value on one row (Y-axis aligned).
 */

import { pageHeaderEntityDetailClass } from "@/lib/page-chrome-classes";

/** Single schema row: icon label left, value right (stacks on xs). */
export const patientDetailDefinitionRowClass =
  "grid grid-cols-1 gap-1 sm:grid-cols-[minmax(8.5rem,11rem)_minmax(0,1fr)] sm:items-start sm:gap-x-4";

/** Primary doctor value — inline avatar + name (email); align label with single-line row when wide. */
export const patientDetailPrimaryDoctorRowClass =
  "grid grid-cols-1 gap-1 sm:grid-cols-[minmax(8.5rem,11rem)_minmax(0,1fr)] sm:items-center sm:gap-x-4";

/** Snapshot tables inside the glass card — no extra outer border (DataTable frame only). */
export const patientDetailSnapshotTableFrameClass =
  "overflow-x-auto rounded-md border-0 bg-transparent shadow-none";

/** Avatar block + schema `<dl>` share one vertical rhythm (`gap-2`), not `space-y-6`. */
export const patientDetailSchemaSectionClass = "space-y-2";

/** Definition list grid rhythm inside entity detail cards. */
export const patientDetailDefinitionListClass = "grid gap-2 text-sm";

/** Value column — aligns with label row on sm+ grids (appointment/invoice detail). */
export const entityDetailDefinitionValueClass =
  "min-w-0 text-sm text-gray-700 sm:pt-0.5";

/** Related People / linked visit identity rows — center label + avatar row on y-axis. */
export const entityDetailDefinitionIdentityRowClass =
  "grid grid-cols-1 gap-1 sm:grid-cols-[minmax(8.5rem,11rem)_minmax(0,1fr)] sm:items-center sm:gap-x-4";

/** Identity value column — flex center, no `sm:pt-0.5` offset. */
export const entityDetailDefinitionIdentityValueClass =
  "min-w-0 flex items-center text-sm text-gray-700";

/** Glass icon circle for schema field labels (sky tone). */
export const entityDetailFieldIconCircleClass =
  "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-sky-200/70 bg-sky-50/80 shadow-[0_2px_8px_rgba(14,165,233,0.15)]";

/** Record audit card icon circle — matches schema field labels. */
export const entityDetailAuditIconCircleClass = entityDetailFieldIconCircleClass;

/** Section heading icon circle (slightly larger). */
export const entityDetailSectionIconCircleClass =
  "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-sky-200/70 bg-sky-50/80 shadow-[0_2px_10px_rgba(14,165,233,0.18)]";

/** Sky divider + rhythm above Related Appointments / Invoices snapshot blocks (CP patient detail). */
export const entityDetailSnapshotSectionShellClass =
  "space-y-3 border-t border-sky-100/80 pt-3";

/**
 * @deprecated Nested flex/inner-scroll shells clip glass shadows — use `appSectionRootClass` via
 * `resolveEntityDetailRootClass` (dashboard-overview single `cp-right-scroll` scroll).
 */
export const entityDetailPageShellClass = "flex min-h-0 flex-1 flex-col text-gray-700";

/**
 * @deprecated Inner `overflow-y-auto` clips card glow — do not use; scroll stays on `cp-right-scroll`.
 */
export const entityDetailScrollMainClass =
  "cp-right-scroll min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain pb-3 text-gray-700";

/** @deprecated Use `appSectionRootClass` / `resolveEntityDetailRootClass`. */
export const entityDetailShellClass = entityDetailPageShellClass;

/** @deprecated Use `pageHeaderEntityDetailClass` — optional sticky fade only; layout is on `PageHeader` root. */
export const entityDetailPageHeaderClass = pageHeaderEntityDetailClass;

/**
 * Inline action row — last `space-y-3` sibling; no bar bg/border (same page layer as card).
 */
export const entityDetailActionsRowClass =
  "flex flex-wrap items-center justify-between gap-2 text-gray-700";

/** @deprecated Alias — use `entityDetailActionsRowClass`. */
export const patientDetailStickyFooterClass = entityDetailActionsRowClass;
