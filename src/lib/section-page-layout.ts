/**
 * Shared vertical rhythm for authenticated page bodies.
 *
 * - `appSectionRootClass` — CP right pane and other scroll areas without `dashboardShellClass` (includes `pb-3`).
 * - `appPortalSectionRootClass` — portal/insights routes inside AuthShell `dashboardShellClass` (shell already has `pb-3`).
 * - `appEntityDetailRootClass` — entity detail with sticky footer clearance + flex min-height shell.
 */

import { entityDetailShellClass } from "@/lib/patient-detail-ui-classes";

/** Stack gap between major sections (PageHeader, stats, tables). */
export const appSectionStackClass = "space-y-3 text-gray-700";

/** Scroll pane without outer bottom inset (control-panel right pane). */
export const appSectionRootClass = `${appSectionStackClass} pb-3`;

/** Inside `dashboardShellClass` — avoid double bottom padding. */
export const appPortalSectionRootClass = appSectionStackClass;

/** Entity detail pages with sticky footer bar + flex shell for short content. */
export const appEntityDetailRootClass = `${appSectionStackClass} pb-24 ${entityDetailShellClass}`;

/** Resolve entity detail root — CP and portal share sticky-footer clearance. */
export function resolveEntityDetailRootClass(
  _shell: AppSectionScrollShell = "control-panel"
): string {
  return appEntityDetailRootClass;
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
