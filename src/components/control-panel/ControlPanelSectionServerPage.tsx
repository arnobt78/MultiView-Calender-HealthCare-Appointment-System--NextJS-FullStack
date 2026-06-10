import { getSessionUser } from "@/lib/session";
import { getUserRole } from "@/lib/rbac";
import type { ControlPanelSidebarTabValue } from "@/lib/control-panel-nav-config";
import { prefetchControlPanelSection } from "@/lib/control-panel-section-prefetch";
import { getControlPanelPageChromeConfig } from "@/lib/control-panel-page-chrome-config";
import {
  ControlPanelChromeIconServer,
  ControlPanelChromeTitleServer,
} from "@/components/control-panel/ControlPanelChromeStaticServer";
import { ControlPanelChromeActionsServer } from "@/components/control-panel/ControlPanelChromeActionsServer";
import { ControlPanelSectionPageClient } from "@/components/control-panel/ControlPanelSectionPageClient";

/**
 * Shared async server entry for dedicated `/control-panel/[segment]` list routes.
 * Prefetches section data, renders SSR chrome fragments, seeds client cache before paint.
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

  const chromeConfig = getControlPanelPageChromeConfig(tab);

  return (
    <ControlPanelSectionPageClient
      tab={tab}
      initial={initial}
      defaultDescription={chromeConfig.description}
      serverChromeIcon={<ControlPanelChromeIconServer tab={tab} />}
      serverChromeTitle={<ControlPanelChromeTitleServer tab={tab} />}
      serverChromeActions={<ControlPanelChromeActionsServer tab={tab} />}
    />
  );
}
