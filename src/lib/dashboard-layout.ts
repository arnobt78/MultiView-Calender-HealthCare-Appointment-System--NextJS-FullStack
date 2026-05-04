/**
 * Shared max-width + horizontal padding for authenticated app chrome.
 * Used by `AuthShell` (main), `Navbar` inner row, and fixed footers so routes
 * stay aligned without repeating `max-w-9xl mx-auto px-*` on every page.
 *
 * Calendar (`/dashboard`) opts out in `AuthShell` — it manages its own insets.
 */
export const dashboardShellClass =
  "w-full max-w-9xl mx-auto min-w-0 px-2 sm:px-4 lg:px-8";
