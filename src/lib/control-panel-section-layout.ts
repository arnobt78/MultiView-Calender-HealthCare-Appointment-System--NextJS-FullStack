/**
 * Control-panel list-tab body layout — matches dashboard-overview vertical rhythm.
 * `space-y-3` + `pb-3` = 12px stack gap and scroll bottom inset (same as `dashboardShellClass`).
 * Spacing only; glass cards / PageHeader migration for legacy tabs is separate work.
 */

/** Canonical CP right-pane section root — PageHeader, stats, table/list siblings. */
export const controlPanelSectionRootClass = "space-y-3 pb-3 text-gray-700";

/** Inline error banner — same pattern as DashboardOverview failure state. */
export const controlPanelSectionErrorBannerClass =
  "flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700";
