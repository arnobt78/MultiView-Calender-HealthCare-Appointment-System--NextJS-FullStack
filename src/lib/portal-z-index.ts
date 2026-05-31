/**
 * App-wide overlay z-index tokens — Radix portals mount on `document.body`.
 * Fixed navbar competes at viewport level (sticky z-index inside `#__next` loses to body portals).
 *
 * Stack (low → high): `Z_POPOVER` (80) < `Z_NAVBAR` (100) < `Z_DIALOG` (110) < `Z_SELECT_DROPDOWN` (120).
 *
 * Navbar height contract (keep in sync):
 *   - `Navbar` inner row: `navbarContentShellClass` + `APP_NAVBAR_INNER_ROW_CLASS` (`min-h-14`, avatar `h-10`, `py-2`)
 *   - `AuthShell` `<main>`: `APP_MAIN_OFFSET_CLASS` = inner row + border + page-chrome top band
 *   - CP / portal page headers: `py-2` on `pageHeaderRootClass` / `pageChromeHeaderShellClass` — top band must sit below main offset
 */

/** Fixed navbar — below dialogs; toolbar Select/Dropdown use `Z_SELECT_DROPDOWN`. */
export const Z_NAVBAR = 100;

/** Navbar inner flex row min height — tallest control is avatar `h-10` within `py-2`. */
export const APP_NAVBAR_INNER_ROW_CLASS = "min-h-14";

/**
 * `<main>` top inset below fixed navbar: `min-h-14` row + `border-b` (1px) + `0.5rem` so header `py-2`
 * is not painted under the navbar on laptop viewports.
 */
export const APP_MAIN_OFFSET_CLASS = "pt-[calc(3.5rem+1px+0.5rem)]";

/** @deprecated Use `APP_MAIN_OFFSET_CLASS`. */
export const APP_NAVBAR_OFFSET_CLASS = APP_MAIN_OFFSET_CLASS;

/**
 * Sticky toolbars on document-scroll routes (below fixed navbar).
 * CP `cp-right-scroll` panes use `APP_INNER_SCROLL_STICKY_TOP_CLASS` (`top-0`) instead.
 */
export const APP_NAVBAR_STICKY_OFFSET_CLASS = "top-[calc(3.5rem+1px+0.5rem)]";

/** Sticky rows inside CP right pane / inner scroll containers (already below navbar via main offset). */
export const APP_INNER_SCROLL_STICKY_TOP_CLASS = "top-0";

/** Radix Select / DropdownMenu inside dialogs — above `Z_DIALOG`. */
export const Z_SELECT_DROPDOWN = 120;

/** Appointment hover cards and similar floating UI. */
export const Z_POPOVER = 80;

/** Dialog / Sheet overlay + content — above fixed navbar (`Z_NAVBAR`). */
export const Z_DIALOG = 110;
