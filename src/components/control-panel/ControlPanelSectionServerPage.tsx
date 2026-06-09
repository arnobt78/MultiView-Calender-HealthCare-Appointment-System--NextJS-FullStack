import { getSessionUser } from "@/lib/session";
import { getUserRole } from "@/lib/rbac";
import type { ControlPanelSidebarTabValue } from "@/lib/control-panel-nav-config";
import { prefetchControlPanelSection } from "@/lib/control-panel-section-prefetch";
import { ControlPanelSectionChromeServer } from "@/components/control-panel/ControlPanelSectionChromeServer";
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
  const role = sessionUser ? await getUserRole(sessionUser.userId) : null;
  const initial =
    sessionUser != null
      ? await prefetchControlPanelSection(tab, sessionUser.userId, sessionUser.email, role)
      : null;

  return (
    <div className="relative w-full">
      <ControlPanelSectionChromeServer tab={tab} />
      <ControlPanelSectionPageClient tab={tab} initial={initial} chromeFromServer />
    </div>
  );
}
