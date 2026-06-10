/**
 * Shared vertical rhythm for authenticated page bodies.
 *
 * - `appSectionRootClass` — CP right pane and other scroll areas without `dashboardShellClass` (includes `pb-3`).
 * - `appPortalSectionRootClass` — portal/insights routes inside AuthShell `dashboardShellClass` (shell already has `pb-3`).
 * - `appEntityDetailRootClass` — CP entity detail outer shell (`pb-3` only; header outside body stack).
 * - `appEntityDetailBodyStackClass` — card/footer vertical rhythm inside `EntityDetailPageShell`.
 */

/** Stack gap between major sections (PageHeader, stats, tables). */
export const appSectionStackClass = "space-y-3 text-gray-700";

/** Scroll pane without outer bottom inset (control-panel right pane). */
export const appSectionRootClass = `${appSectionStackClass} pb-3`;

/** Inside `dashboardShellClass` — avoid double bottom padding. */
export const appPortalSectionRootClass = appSectionStackClass;

/**
 * CP entity detail root — `pb-3` only; header sits outside body stack (REQ-0061).
 * Body rhythm via `appEntityDetailBodyStackClass` inside `EntityDetailPageShell`.
 */
export const appEntityDetailRootClass = "pb-3 text-gray-700";

/** Vertical gap between card, banners, and footer — not between header and first body block. */
export const appEntityDetailBodyStackClass = appSectionStackClass;

/** Portal entity detail outer shell — no space-y (body stack owns rhythm; no double pb-3). */
export const appPortalEntityDetailRootClass = "text-gray-700";

/** Resolve entity detail root — CP includes `pb-3`; portal avoids double bottom inset. */
export function resolveEntityDetailRootClass(
  shell: AppSectionScrollShell = "control-panel"
): string {
  return shell === "control-panel" ? appEntityDetailRootClass : appPortalEntityDetailRootClass;
}

/** Inline fetch/section failure banner. */
export const appSectionErrorBannerClass =
  "flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700";

/** Demo showcase intentional-limitation note — emerald glass (doctor management, etc.). */
export const appSectionDemoNoteBannerClass =
  "flex items-start gap-3 rounded-xl border border-emerald-200/70 bg-emerald-50/80 px-3 py-2.5 text-emerald-900";

export type AppSectionScrollShell = "control-panel" | "portal";

/** Pick root class from scroll shell — CP panes need `pb-3`; portal shell already insets bottom. */
export function resolveAppSectionRootClass(
  shell: AppSectionScrollShell = "portal"
): string {
  return shell === "control-panel" ? appSectionRootClass : appPortalSectionRootClass;
}
