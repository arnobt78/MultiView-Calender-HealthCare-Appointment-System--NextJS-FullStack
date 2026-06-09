"use client";

import { cn } from "@/lib/utils";
import { AppPageChrome } from "@/components/shared/AppPageChrome";
import { useControlPanelChromeFromServer } from "@/components/control-panel/ControlPanelChromeContext";
import {
  getControlPanelPageChromeConfig,
  type ControlPanelPageChromeConfig,
} from "@/lib/control-panel-page-chrome-config";
import type { ControlPanelSidebarTabValue } from "@/lib/control-panel-nav-config";
type ControlPanelPageChromeProps = {
  tab: ControlPanelSidebarTabValue;
  /** Override config title (default from sidebar label). */
  title?: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  toolbar?: React.ReactNode;
  loading?: boolean;
  className?: string;
};

/**
 * CP list-section header — icon tile + border-b + sticky blur.
 * When server chrome is active, only `actions`/`toolbar` render (overlay row).
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
  const chromeFromServer = useControlPanelChromeFromServer();
  const config: ControlPanelPageChromeConfig = getControlPanelPageChromeConfig(tab);

  if (chromeFromServer) {
    if (!actions && !toolbar) return null;
    return (
      <div
        className={cn(
          "pointer-events-none absolute inset-x-0 top-0 z-30 flex min-h-[3.5rem] items-center justify-end gap-2 px-0",
          className
        )}
      >
        {actions ? (
          <div className="pointer-events-auto flex shrink-0 flex-wrap items-center justify-end gap-2">
            {actions}
          </div>
        ) : null}
        {toolbar ? (
          <div className="pointer-events-auto w-full">{toolbar}</div>
        ) : null}
      </div>
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
      borderBottom
      loading={loading}
      className={className}
    />
  );
}
