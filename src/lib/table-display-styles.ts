/**
 * Shared clinical / control-panel table typography and row rhythm.
 * Header token is consumed by `DataTableColumnHeader` (single source for all TanStack tables).
 * Cell/stack tokens are imported directly in identity cells and snapshot column builders.
 */

/** Sortable + static `<th>` label typography — imported by `DataTableColumnHeader` only. */
export const clinicalTableHeadClass = "text-sm font-medium text-muted-foreground";

/** Minimum row height for identity stacks (avatar + 2–3 text lines). */
export const clinicalTableCellMinRowClass = "min-h-[2.75rem]";

/** Vertical gap between name / email / badge lines inside a cell. */
export const clinicalStackGapClass = "gap-0.5";

/** Primary cell text (care tier, location, dates). */
export const clinicalCellPrimaryTextClass = "text-sm text-gray-700";

/** Secondary lines (email under name, time sub-lines). */
export const clinicalCellMutedTextClass = "text-xs text-muted-foreground";

/** Entity detail links — matches `EntityTitleLink` sky accent app-wide. */
export const entityDetailLinkClass =
  "text-sky-700 no-underline transition-colors hover:bg-sky-50/60 hover:text-sky-800";

/**
 * Snapshot / clinical table column shells — `table-auto` + `min-w-*` keeps cells wrapping on ~14" viewports.
 * Apply via column `meta.shellClassName` (shared by `DataTable` head + body).
 */
/** Title stack — width from `meta.colWidth` on snapshot tables. */
export const clinicalTableColumnTitleShellClass =
  "align-top overflow-hidden";

/** When — width from `meta.colWidth`; no vertical clip on two-line time range. */
export const clinicalTableColumnWhenShellClass =
  "align-top overflow-x-hidden overflow-y-visible whitespace-nowrap";

/** Category — width from `meta.colWidth`; wrap inside cell only. */
export const clinicalTableColumnCategoryShellClass =
  "align-top overflow-hidden whitespace-normal break-words [overflow-wrap:break-word]";

/** Location — width from `meta.colWidth`. */
export const clinicalTableColumnWrapShellClass =
  "align-top overflow-hidden whitespace-normal break-words [overflow-wrap:break-word]";

/** Category color dot + label row (detail schema + table). */
export const clinicalCategoryLabelRowClass =
  "flex w-full min-w-0 max-w-full items-start gap-1.5";

/** Optical center: align 8px swatch with cap height of `text-sm` label. */
export const clinicalCategorySwatchAnchorClass = "mt-[0.35em] inline-flex shrink-0 leading-none";

/** Doctor identity stacks — width from `meta.colWidth` on snapshot tables. */
export const clinicalTableColumnIdentityShellClass = "align-top overflow-hidden";

/** Multi-line body inside a wrapping column — use on inner cell divs. */
export const clinicalTableCellWrapClass =
  "min-w-0 break-words [overflow-wrap:anywhere]";
