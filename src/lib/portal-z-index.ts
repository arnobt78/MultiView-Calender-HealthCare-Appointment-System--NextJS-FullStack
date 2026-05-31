/**
 * App-wide overlay z-index tokens — Radix portals mount on `document.body`.
 * Fixed navbar competes at viewport level (sticky z-index inside `#__next` loses to body portals).
 *
 * Stack (low → high): `Z_POPOVER` (80) < `Z_NAVBAR` (100) < `Z_DIALOG` (110) < `Z_SELECT_DROPDOWN` (120).
 *
 * Navbar height contract:
 *   - `Navbar` publishes `--app-navbar-height` via `useAppNavbarHeightSync` (ResizeObserver on `[data-slot=app-navbar]`)
 *   - `AuthShell` `<main>`: `APP_MAIN_OFFSET_CLASS` = `pt-[var(--app-navbar-height,…)]` — no extra static gap
 *   - Page headers keep their own `py-2`; main offset matches measured fixed chrome only
 */

/** Fixed navbar — below dialogs; toolbar Select/Dropdown use `Z_SELECT_DROPDOWN`. */
export const Z_NAVBAR = 100;

/** CSS custom property written by `useAppNavbarHeightSync` (px). */
export const APP_NAVBAR_HEIGHT_CSS_VAR = "--app-navbar-height";

/** SSR / first-paint fallback — single-row navbar (`min-h-14` + `border-b`). */
export const APP_NAVBAR_HEIGHT_FALLBACK = "calc(3.5rem + 1px)";

/** Navbar inner flex row min height — tallest control is avatar `h-10` within `py-2`. */
export const APP_NAVBAR_INNER_ROW_CLASS = "min-h-14";

/** `<main>` top inset — tracks live navbar height (admin multi-link vs doctor/patient). */
export const APP_MAIN_OFFSET_CLASS = `pt-[var(${APP_NAVBAR_HEIGHT_CSS_VAR},${APP_NAVBAR_HEIGHT_FALLBACK})]`;

/** @deprecated Use `APP_MAIN_OFFSET_CLASS`. */
export const APP_NAVBAR_OFFSET_CLASS = APP_MAIN_OFFSET_CLASS;

/** Sticky toolbars on document-scroll routes (below fixed navbar). */
export const APP_NAVBAR_STICKY_OFFSET_CLASS = `top-[var(${APP_NAVBAR_HEIGHT_CSS_VAR},${APP_NAVBAR_HEIGHT_FALLBACK})]`;

/** Sticky rows inside CP right pane / inner scroll containers (already below navbar via main offset). */
export const APP_INNER_SCROLL_STICKY_TOP_CLASS = "top-0";

/** Radix Select / DropdownMenu inside dialogs — above `Z_DIALOG`. */
export const Z_SELECT_DROPDOWN = 120;

/** Appointment hover cards and similar floating UI. */
export const Z_POPOVER = 80;

/** Dialog / Sheet overlay + content — above fixed navbar (`Z_NAVBAR`). */
export const Z_DIALOG = 110;
