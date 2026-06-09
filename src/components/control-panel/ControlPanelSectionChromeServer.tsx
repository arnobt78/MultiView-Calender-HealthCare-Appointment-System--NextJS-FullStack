/**
 * Server-rendered CP section chrome — static title/icon row (no client hooks).
 * Paired with `ControlPanelSectionPageClient` when `hideChrome` is set on the client body.
 */

import { AppPageChromeServer } from "@/components/shared/AppPageChromeServer";
import { getControlPanelPageChromeConfig } from "@/lib/control-panel-page-chrome-config";
import type { ControlPanelSidebarTabValue } from "@/lib/control-panel-nav-config";

export function ControlPanelSectionChromeServer({
  tab,
}: {
  tab: ControlPanelSidebarTabValue;
}) {
  const config = getControlPanelPageChromeConfig(tab);

  return (
    <AppPageChromeServer
      variant="control-panel"
      icon={config.icon}
      tone={config.tone}
      title={config.title}
      description={config.description}
    />
  );
}
