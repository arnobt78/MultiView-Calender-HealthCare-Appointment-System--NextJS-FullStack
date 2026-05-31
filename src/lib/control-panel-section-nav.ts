import { CONTROL_PANEL_TAB_TO_SEGMENT } from "@/lib/control-panel-nav-config";

/** List-route href for a control-panel sidebar tab (not detail sub-routes). */
export function controlPanelListHrefForTab(tab: string): string {
  const segment =
    CONTROL_PANEL_TAB_TO_SEGMENT[tab] ?? CONTROL_PANEL_TAB_TO_SEGMENT.overview;
  return `/control-panel/${segment}`;
}

/**
 * Navigate to section list — always runs on trigger click so detail pages
 * (e.g. `/control-panel/patients/[id]`) can return to list when tab is already active.
 */
export function navigateControlPanelSectionList(
  pathname: string,
  tab: string,
  replace: (href: string) => void
): void {
  const target = controlPanelListHrefForTab(tab);
  if (pathname !== target) {
    replace(target);
  }
}
