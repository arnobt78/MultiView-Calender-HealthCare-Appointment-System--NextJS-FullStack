/**
 * Shared page header chrome — `/services`, `/patient-portal`, `/dashboard` calendar,
 * `/insights`, and other top-of-page title rows. Keep padding/height in sync here.
 */

/** Outer shell: border + vertical rhythm (`py-2` matches control-panel `PageHeader`). */
export const pageChromeHeaderShellClass =
  "flex flex-col gap-2 border-b py-2 md:flex-row md:items-stretch md:justify-between";

/** Sky icon tile — `min-h-[3.5rem]` sets the header row height on portal pages. */
export const pageChromeIconTileClass =
  "flex w-12 shrink-0 items-center justify-center self-stretch min-h-[3.5rem] rounded-xl border border-sky-200 bg-sky-100";

export const pageChromeIconClass = "h-6 w-6 text-sky-600";

export const pageChromeTitleClass =
  "text-xl font-semibold tracking-tight text-gray-700 md:text-2xl";

export const pageChromeDescriptionClass = "text-sm text-muted-foreground";

/** Optional second row under title (dashboard date nav + view tabs). */
export const pageChromeToolbarRowClass =
  "flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between";

/** Dashboard toolbar-only shell — no title/icon, no bottom border (filters row provides separation). */
export const pageChromeToolbarOnlyShellClass = "py-2";

export const pageChromeToolbarOnlyInnerClass =
  "flex min-h-[3.5rem] min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between";
