/**
 * App-wide overlay z-index tokens — Radix portals mount on `document.body`.
 * Fixed navbar competes at viewport level (sticky z-index inside `#__next` loses to body portals).
 *
 * Stack (low → high): `Z_POPOVER` (80) < `Z_NAVBAR` (100) < `Z_DIALOG` (110) < `Z_SELECT_DROPDOWN` (120).
 *
 * Navbar height contract:
 *   - CSS: `globals.css` — `:root { --app-navbar-height }`, `.app-main-offset`, `.app-navbar-sticky-top`
 *   - `Navbar` overwrites `--app-navbar-height` via `useAppNavbarHeightSync` (ResizeObserver)
 *   - `AuthShell` `<main>` uses `APP_MAIN_OFFSET_CLASS` (`.app-main-offset`)
 */

/** Fixed navbar — below dialogs; toolbar Select/Dropdown use `Z_SELECT_DROPDOWN`. */
export const Z_NAVBAR = 100;

/** CSS custom property on `<html>` — px from ResizeObserver; SSR default in `globals.css`. */
export const APP_NAVBAR_HEIGHT_CSS_VAR = "--app-navbar-height";

/** SSR first-paint default (matches `:root` in globals.css). */
export const APP_NAVBAR_HEIGHT_FALLBACK = "calc(3.5rem + 1px)";

/** Navbar inner flex row min height — tallest control is avatar `h-10` within `py-2`. */
export const APP_NAVBAR_INNER_ROW_CLASS = "min-h-14";

/** `<main>` top inset — see `.app-main-offset` in `globals.css`. */
export const APP_MAIN_OFFSET_CLASS = "app-main-offset";

/** @deprecated Use `APP_MAIN_OFFSET_CLASS`. */
export const APP_NAVBAR_OFFSET_CLASS = APP_MAIN_OFFSET_CLASS;

/** Document-scroll sticky rows below fixed navbar — see `.app-navbar-sticky-top`. */
export const APP_NAVBAR_STICKY_OFFSET_CLASS = "app-navbar-sticky-top";

/** Sticky rows inside CP right pane / inner scroll containers (already below navbar via main offset). */
export const APP_INNER_SCROLL_STICKY_TOP_CLASS = "top-0";

/** Radix Select / DropdownMenu inside dialogs — above `Z_DIALOG`. */
export const Z_SELECT_DROPDOWN = 120;

/** Appointment hover cards and similar floating UI. */
export const Z_POPOVER = 80;

/** Dialog / Sheet overlay + content — above fixed navbar (`Z_NAVBAR`). */
export const Z_DIALOG = 110;
