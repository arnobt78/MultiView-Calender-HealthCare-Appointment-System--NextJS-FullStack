/**
 * App-wide overlay z-index tokens — Radix `Select` portals mount on `document.body`.
 * Navbar uses `position: fixed` so `Z_NAVBAR` competes at viewport level (sticky z-index inside `#__next` loses to body portals).
 */

/** Fixed navbar — above portalled filter menus (`Z_SELECT_DROPDOWN`). */
export const Z_NAVBAR = 100;

/** Tailwind offset for fixed navbar (`h-8` logo + `py-2` + border). */
export const APP_NAVBAR_OFFSET_CLASS = "pt-14";

/** Sticky sub-toolbars (patient filters) sit below fixed navbar. */
export const APP_NAVBAR_STICKY_OFFSET_CLASS = "top-14";

/** Radix Select / DropdownMenu / Tooltip / HoverCard content (see `select.tsx`). */
export const Z_SELECT_DROPDOWN = 50;

/** Appointment hover cards and similar floating UI. */
export const Z_POPOVER = 80;

/** Dialog / Sheet overlay + content — same layer as shadcn defaults. */
export const Z_DIALOG = 50;
