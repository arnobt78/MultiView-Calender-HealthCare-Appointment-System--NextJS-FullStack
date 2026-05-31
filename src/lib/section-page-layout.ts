/**
 * Shared vertical rhythm for authenticated page bodies.
 *
 * - `appSectionRootClass` — CP right pane and other scroll areas without `dashboardShellClass` (includes `pb-3`).
 * - `appPortalSectionRootClass` — portal/insights routes inside AuthShell `dashboardShellClass` (shell already has `pb-3`).
 * - `appEntityDetailRootClass` — same single-scroll contract as dashboard-overview (no nested overflow).
 */

/** Stack gap between major sections (PageHeader, stats, tables). */
export const appSectionStackClass = "space-y-3 text-gray-700";

/** Scroll pane without outer bottom inset (control-panel right pane). */
export const appSectionRootClass = `${appSectionStackClass} pb-3`;

/** Inside `dashboardShellClass` — avoid double bottom padding. */
export const appPortalSectionRootClass = appSectionStackClass;

/** CP entity detail — identical scroll shell to dashboard-overview / patient-management. */
export const appEntityDetailRootClass = appSectionRootClass;

/** Portal entity detail — portal stack rhythm; document scroll via AuthShell. */
export const appPortalEntityDetailRootClass = appPortalSectionRootClass;

/** Resolve entity detail root — CP includes `pb-3`; portal avoids double bottom inset. */
export function resolveEntityDetailRootClass(
  shell: AppSectionScrollShell = "control-panel"
): string {
  return shell === "control-panel" ? appEntityDetailRootClass : appPortalEntityDetailRootClass;
}

/** Inline fetch/section failure banner. */
export const appSectionErrorBannerClass =
  "flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700";

export type AppSectionScrollShell = "control-panel" | "portal";

/** Pick root class from scroll shell — CP panes need `pb-3`; portal shell already insets bottom. */
export function resolveAppSectionRootClass(
  shell: AppSectionScrollShell = "portal"
): string {
  return shell === "control-panel" ? appSectionRootClass : appPortalSectionRootClass;
}
