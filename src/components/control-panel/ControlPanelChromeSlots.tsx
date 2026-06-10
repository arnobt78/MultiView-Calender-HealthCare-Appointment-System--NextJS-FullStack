"use client";

import { useSyncExternalStore, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import {
  pageChromeToolbarRowClass,
  pageHeaderDescriptionClass,
} from "@/lib/page-chrome-classes";
import { useControlPanelChromeRegistryContext } from "@/components/control-panel/ControlPanelChromeContext";
import {
  getControlPanelChromeSnapshot,
  subscribeControlPanelChrome,
} from "@/lib/control-panel-chrome-sync-store";
import { ControlPanelChromeActionsShell } from "@/components/control-panel/ControlPanelChromeActionsShell";
import type { ControlPanelSidebarTabValue } from "@/lib/control-panel-nav-config";

/** Default or section-overridden subtitle — sits in merged header left stack. */
export function ControlPanelChromeDescriptionSlot() {
  const { registry, defaultDescription } = useControlPanelChromeRegistryContext();
  const syncRegistry = useSyncExternalStore(
    subscribeControlPanelChrome,
    getControlPanelChromeSnapshot,
    getControlPanelChromeSnapshot
  );
  const description =
    syncRegistry.description ?? registry.description ?? defaultDescription;
  if (!description) return null;
  return <div className={pageHeaderDescriptionClass}>{description}</div>;
}

type ActionsSlotProps = {
  tab: ControlPanelSidebarTabValue;
  /** SSR decorative shells — shown until live actions register. */
  serverChromeActions?: React.ReactNode;
};

/** Right column — live actions from sync store; SSR or client shells until registered. */
export function ControlPanelChromeActionsSlot({
  tab,
  serverChromeActions,
}: ActionsSlotProps) {
  const syncRegistry = useSyncExternalStore(
    subscribeControlPanelChrome,
    getControlPanelChromeSnapshot,
    getControlPanelChromeSnapshot
  );

  if (syncRegistry.actions) {
    return (
      <div className="flex shrink-0 flex-wrap items-center justify-end gap-2 self-center">
        {syncRegistry.actions}
      </div>
    );
  }

  if (serverChromeActions) {
    return <>{serverChromeActions}</>;
  }

  return <ControlPanelChromeActionsShell tab={tab} />;
}

/** Optional second row under title/actions (filters, export toolbar). */
export function ControlPanelChromeToolbarSlot() {
  const syncRegistry = useSyncExternalStore(
    subscribeControlPanelChrome,
    getControlPanelChromeSnapshot,
    getControlPanelChromeSnapshot
  );
  if (!syncRegistry.toolbar) return null;
  return (
    <div className={cn(pageChromeToolbarRowClass, "w-full")}>{syncRegistry.toolbar}</div>
  );
}
