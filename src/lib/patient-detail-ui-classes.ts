/**
 * Patient detail definition list — label + value on one row (Y-axis aligned).
 */

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

/** Glass icon circle for schema field labels (sky tone). */
export const entityDetailFieldIconCircleClass =
  "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-sky-200/70 bg-sky-50/80 shadow-[0_2px_8px_rgba(14,165,233,0.15)]";

/** Record audit card icon circle — matches schema field labels. */
export const entityDetailAuditIconCircleClass = entityDetailFieldIconCircleClass;

/** Section heading icon circle (slightly larger). */
export const entityDetailSectionIconCircleClass =
  "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-sky-200/70 bg-sky-50/80 shadow-[0_2px_10px_rgba(14,165,233,0.18)]";

/** Flex shell so sticky footer pins to viewport bottom when content is short. */
export const entityDetailShellClass = "flex min-h-full flex-col";

/** Tighter entity detail PageHeader — less gap under title/description. */
export const entityDetailPageHeaderClass =
  "gap-2 bg-gradient-to-b from-white via-white/95 to-transparent pb-0";

/**
 * Sticky action bar — always mounted; buttons stay visible during refetch (disabled only).
 * `min-h` matches glass action button row so layout does not jump on hydrate.
 */
export const patientDetailStickyFooterClass =
  "sticky bottom-0 z-10 -mx-2 min-h-[3.25rem] border-t border-sky-100/60 bg-white/95 px-2 py-3 text-gray-700 backdrop-blur supports-backdrop-filter:bg-white/85 sm:-mx-4 sm:px-4 lg:-mx-8 lg:px-8";
