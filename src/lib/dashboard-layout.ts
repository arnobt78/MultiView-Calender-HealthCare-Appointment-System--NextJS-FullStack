/**
 * Shared max-width + horizontal padding for authenticated app chrome.
 * Used by `AuthShell` (main), `Navbar` inner row, and fixed footers so routes
 * stay aligned without repeating `max-w-9xl mx-auto px-*` on every page.
 *
 * Calendar (`/dashboard`) opts out in `AuthShell` — `CalendarHeader` applies `dashboardShellClass` on `PortalChromeHeader`.
 */
export const dashboardShellClass =
  "w-full max-w-9xl mx-auto min-w-0 px-2 sm:px-4 lg:px-8";

/** Same inset as `dashboardShellClass`; used only under `src/app/control-panel/layout.tsx` because `/control-panel/*` opts out of `AuthShell`'s global shell (mirrors stock-inventory admin route layout). */
export const controlPanelShellClass = dashboardShellClass;
