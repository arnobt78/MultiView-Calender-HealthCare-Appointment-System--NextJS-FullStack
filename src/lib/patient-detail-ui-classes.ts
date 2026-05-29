/**
 * Patient detail definition list — label + value on one row (Y-axis aligned).
 */

/** Single schema row: icon label left, value right (stacks on xs). */
export const patientDetailDefinitionRowClass =
  "grid grid-cols-1 gap-1 sm:grid-cols-[minmax(8.5rem,11rem)_minmax(0,1fr)] sm:items-start sm:gap-x-4";

/** Snapshot tables inside the glass card — no extra outer border (DataTable frame only). */
export const patientDetailSnapshotTableFrameClass =
  "overflow-x-auto rounded-md border-0 bg-transparent shadow-none";
