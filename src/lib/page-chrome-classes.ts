/**
 * Shared page header chrome — `/services`, `/patient-portal`, `/dashboard` calendar,
 * `/insights`, and other top-of-page title rows. Keep padding/height in sync here.
 */

/** Outer shell: border + vertical rhythm (`py-2` matches control-panel `PageHeader`). */
export const pageChromeHeaderShellClass =
  "flex flex-col gap-2 border-b py-2 md:flex-row md:items-stretch md:justify-between";

/** Sky icon tile — `min-h-[3.5rem]` sets the header row height on portal pages (square photo or Lucide icon). */
export const pageChromeIconTileClass =
  "flex w-12 shrink-0 items-center justify-center self-stretch min-h-[3.5rem] rounded-xl border border-sky-200 bg-sky-100";

/** Title + subtitle stack — no `gap-*` between lines; matches `PortalChromeHeader` / insights pages. */
export const pageChromeTitleStackClass = "flex min-w-0 flex-1 flex-col justify-center";

export const pageChromeIconClass = "h-6 w-6 text-sky-600";

export const pageChromeTitleClass =
  "text-xl font-semibold tracking-tight text-gray-700 md:text-2xl";

export const pageChromeDescriptionClass = "text-sm leading-relaxed text-gray-700";

/** Optional second row under title (dashboard date nav + view tabs). */
export const pageChromeToolbarRowClass =
  "flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between";

/** Dashboard toolbar-only shell — no title/icon, no bottom border (filters row provides separation). */
export const pageChromeToolbarOnlyShellClass = "py-2";

export const pageChromeToolbarOnlyInnerClass =
  "flex min-h-[3.5rem] min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between";

/** In-card section title row inside `PortalPanelSection` (patient-portal / doctor-portal panels). */
export const portalPanelSectionHeadingClass =
  "mb-3 flex flex-wrap items-center gap-2 text-sm font-semibold text-gray-700";

/**
 * Control-panel / entity detail `PageHeader` — whole row gets `py-2` + min height (matches portal icon tile).
 * Title stack uses `pageChromeTitleStackClass` (no `mt-*` between title and subtitle).
 */
export const pageHeaderRootClass =
  "flex min-h-[3.5rem] flex-col sm:flex-row sm:items-center justify-between gap-4 py-2 sticky top-0 z-20 backdrop-blur-sm";

export const pageHeaderTitleClass =
  "text-xl font-semibold tracking-tight text-gray-700";

/** Matches list/management pages — subtitle sits flush under title (no `mt-0.5`). */
export const pageHeaderDescriptionClass = "text-xs text-gray-500 sm:text-sm leading-relaxed";

/** Optional fade when header sticks over scrolling CP content. */
export const pageHeaderEntityDetailClass =
  "bg-gradient-to-b from-white via-white/95 to-transparent";
