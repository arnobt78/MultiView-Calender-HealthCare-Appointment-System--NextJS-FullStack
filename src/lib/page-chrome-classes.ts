/**
 * Shared page header chrome — `/services`, `/patient-portal`, `/dashboard` calendar,
 * `/insights`, and other top-of-page title rows. Keep padding/height in sync here.
 */

/** Outer shell: border + vertical rhythm (`py-2` matches control-panel `PageHeader`). Clears navbar via `APP_MAIN_OFFSET_CLASS`. */
export const pageChromeHeaderShellClass =
  "flex flex-col gap-2 border-b py-2 md:flex-row md:items-stretch md:justify-between";

/** Sky icon tile — `min-h-[3.5rem]` sets the header row height on portal pages (square photo or Lucide icon). */
export const pageChromeIconTileClass =
  "flex w-12 shrink-0 items-center justify-center self-stretch min-h-[3.5rem] rounded-xl border border-sky-200 bg-sky-100";

/** Title + subtitle stack — no `gap-*` between lines; matches `PortalChromeHeader` / insights pages. */
export const pageChromeTitleStackClass = "flex min-w-0 flex-1 flex-col justify-center";

export const pageChromeIconClass = "h-6 w-6 text-sky-600";

/** Entity detail chrome icon tiles — scaled portal tile per tone (appointment/invoice/doctor/category). */
export const entityDetailChromeSkyIconTileClass = pageChromeIconTileClass;

export const entityDetailChromeVioletIconTileClass =
  "flex w-12 shrink-0 items-center justify-center self-stretch min-h-[3.5rem] rounded-xl border border-violet-200 bg-violet-100";

export const entityDetailChromeAmberIconTileClass =
  "flex w-12 shrink-0 items-center justify-center self-stretch min-h-[3.5rem] rounded-xl border border-amber-200 bg-amber-100";

export const entityDetailChromeEmeraldIconTileClass =
  "flex w-12 shrink-0 items-center justify-center self-stretch min-h-[3.5rem] rounded-xl border border-emerald-200 bg-emerald-100";

export const entityDetailChromeSkyIconClass = pageChromeIconClass;
export const entityDetailChromeVioletIconClass = "h-6 w-6 text-violet-600";
export const entityDetailChromeAmberIconClass = "h-6 w-6 text-amber-600";
export const entityDetailChromeEmeraldIconClass = "h-6 w-6 text-emerald-600";

export const entityDetailChromeIndigoIconTileClass =
  "flex w-12 shrink-0 items-center justify-center self-stretch min-h-[3.5rem] rounded-xl border border-indigo-200 bg-indigo-100";

export const entityDetailChromeSlateIconTileClass =
  "flex w-12 shrink-0 items-center justify-center self-stretch min-h-[3.5rem] rounded-xl border border-slate-200 bg-slate-100";

export const entityDetailChromeRoseIconTileClass =
  "flex w-12 shrink-0 items-center justify-center self-stretch min-h-[3.5rem] rounded-xl border border-rose-200 bg-rose-100";

export const entityDetailChromeIndigoIconClass = "h-6 w-6 text-indigo-600";
export const entityDetailChromeSlateIconClass = "h-6 w-6 text-slate-600";
export const entityDetailChromeRoseIconClass = "h-6 w-6 text-rose-600";

/** CP + portal page chrome tones — tile + icon class pairs for `AppPageChrome`. */
export type PageChromeTone = "sky" | "violet" | "emerald" | "amber" | "indigo" | "slate" | "rose";

export const PAGE_CHROME_TONE_CLASSES: Record<
  PageChromeTone,
  { tile: string; icon: string }
> = {
  sky: { tile: pageChromeIconTileClass, icon: pageChromeIconClass },
  violet: { tile: entityDetailChromeVioletIconTileClass, icon: entityDetailChromeVioletIconClass },
  emerald: { tile: entityDetailChromeEmeraldIconTileClass, icon: entityDetailChromeEmeraldIconClass },
  amber: { tile: entityDetailChromeAmberIconTileClass, icon: entityDetailChromeAmberIconClass },
  indigo: { tile: entityDetailChromeIndigoIconTileClass, icon: entityDetailChromeIndigoIconClass },
  slate: { tile: entityDetailChromeSlateIconTileClass, icon: entityDetailChromeSlateIconClass },
  rose: { tile: entityDetailChromeRoseIconTileClass, icon: entityDetailChromeRoseIconClass },
};

export const pageChromeTitleClass =
  "text-lg font-semibold tracking-tight text-gray-700 md:text-xl";

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
 * Top `py-2` band clears fixed navbar via `APP_MAIN_OFFSET_CLASS` (`--app-navbar-height`) on `AuthShell` `<main>`.
 */
export const pageHeaderRootClass =
  "flex min-h-[3.5rem] flex-col sm:flex-row sm:items-center justify-between gap-4 py-2 sticky top-0 z-20 bg-transparent backdrop-blur-sm";

export const pageHeaderTitleClass =
  "text-lg font-semibold tracking-tight text-gray-700";

/** Matches list/management pages — subtitle sits flush under title (no `mt-0.5`). */
export const pageHeaderDescriptionClass = "text-xs text-gray-500 sm:text-sm leading-relaxed";

/** Optional fade when header sticks over scrolling CP content. */
export const pageHeaderEntityDetailClass =
  "bg-gradient-to-b from-white via-white/95 to-transparent";
