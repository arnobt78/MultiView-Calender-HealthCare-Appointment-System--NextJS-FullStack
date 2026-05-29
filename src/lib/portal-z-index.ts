/**
 * App-wide overlay z-index tokens — Radix portals mount on `document.body`.
 * Fixed navbar competes at viewport level (sticky z-index inside `#__next` loses to body portals).
 *
 * Stack (low → high): `Z_POPOVER` (80) < `Z_NAVBAR` (100) < `Z_DIALOG` (110) < `Z_SELECT_DROPDOWN` (120).
 */

/** Fixed navbar — below dialogs; toolbar Select/Dropdown use `Z_SELECT_DROPDOWN`. */
export const Z_NAVBAR = 100;

/** Tailwind offset for fixed navbar (`h-8` logo + `py-2` + border). */
export const APP_NAVBAR_OFFSET_CLASS = "pt-14";

/** Sticky sub-toolbars (patient filters) sit below fixed navbar. */
export const APP_NAVBAR_STICKY_OFFSET_CLASS = "top-14";

/** Radix Select / DropdownMenu inside dialogs — above `Z_DIALOG`. */
export const Z_SELECT_DROPDOWN = 120;

/** Appointment hover cards and similar floating UI. */
export const Z_POPOVER = 80;

/** Dialog / Sheet overlay + content — above fixed navbar (`Z_NAVBAR`). */
export const Z_DIALOG = 110;
