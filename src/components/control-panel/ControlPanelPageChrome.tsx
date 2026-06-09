"use client";

import { AppPageChrome } from "@/components/shared/AppPageChrome";
import {
  getControlPanelPageChromeConfig,
  type ControlPanelPageChromeConfig,
} from "@/lib/control-panel-page-chrome-config";
import type { ControlPanelSidebarTabValue } from "@/lib/control-panel-nav-config";
import { ControlPanelChromeActions } from "@/components/control-panel/ControlPanelChromeActions";
import { useControlPanelChromeFromServer } from "@/components/control-panel/ControlPanelChromeContext";

type ControlPanelPageChromeProps = {
  tab: ControlPanelSidebarTabValue;
  title?: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  toolbar?: React.ReactNode;
  loading?: boolean;
  className?: string;
};

/**
 * CP section header — inside merged shell registers actions via `ControlPanelChromeActions`.
 * Outside merged shell (legacy paths) renders full `AppPageChrome`.
 */
export function ControlPanelPageChrome({
  tab,
  title,
  description,
  actions,
  toolbar,
  loading,
  className,
}: ControlPanelPageChromeProps) {
  const inMergedShell = useControlPanelChromeFromServer();
  const config: ControlPanelPageChromeConfig = getControlPanelPageChromeConfig(tab);

  if (inMergedShell) {
    if (!actions && !toolbar && !description && !title) {
      return null;
    }
    return (
      <ControlPanelChromeActions
        actions={actions}
        toolbar={toolbar}
        description={description}
        title={title}
      />
    );
  }

  return (
    <AppPageChrome
      variant="control-panel"
      icon={config.icon}
      tone={config.tone}
      title={title ?? config.title}
      description={description ?? config.description}
      actions={actions}
      toolbar={toolbar}
      sticky
      loading={loading}
      className={className}
    />
  );
}
