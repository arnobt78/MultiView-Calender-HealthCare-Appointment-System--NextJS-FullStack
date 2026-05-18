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
