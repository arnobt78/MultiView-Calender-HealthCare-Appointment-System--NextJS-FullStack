import { getSessionUser } from "@/lib/session";
import type { ControlPanelSidebarTabValue } from "@/lib/control-panel-nav-config";
import { prefetchControlPanelSection } from "@/lib/control-panel-section-prefetch";
import { ControlPanelSectionPageClient } from "@/components/control-panel/ControlPanelSectionPageClient";

/**
 * Shared async server entry for dedicated `/control-panel/[segment]` list routes.
 * Prefetches only the active section's data, then seeds client cache before paint.
 */
export async function ControlPanelSectionServerPage({
  tab,
}: {
  tab: ControlPanelSidebarTabValue;
}) {
  const sessionUser = await getSessionUser();
  const initial =
    sessionUser != null
      ? await prefetchControlPanelSection(tab, sessionUser.userId, sessionUser.email)
      : null;

  return <ControlPanelSectionPageClient tab={tab} initial={initial} />;
}
