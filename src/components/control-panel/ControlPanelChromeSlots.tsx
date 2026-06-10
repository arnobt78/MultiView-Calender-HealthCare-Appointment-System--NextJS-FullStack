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

/**
 * Subscribe for updates; read live snapshot each render — body (order-2) registers
 * before header (order-1) in the same commit so getSnapshot must not be cached early.
 */
function useControlPanelChromeSnapshot() {
  useSyncExternalStore(
    subscribeControlPanelChrome,
    getControlPanelChromeSnapshot,
    getControlPanelChromeSnapshot
  );
  return getControlPanelChromeSnapshot();
}

/** Default or section-overridden subtitle — sits in merged header left stack. */
export function ControlPanelChromeDescriptionSlot() {
  const { defaultDescription, activeTab } = useControlPanelChromeRegistryContext();
  const syncSnapshot = useControlPanelChromeSnapshot();
  const syncApplies =
    syncSnapshot.tab === activeTab && syncSnapshot.registry.description != null;

  if (syncApplies) {
    return <>{syncSnapshot.registry.description}</>;
  }

  if (!defaultDescription) return null;
  return <div className={pageHeaderDescriptionClass}>{defaultDescription}</div>;
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
  const { activeTab } = useControlPanelChromeRegistryContext();
  const syncSnapshot = useControlPanelChromeSnapshot();
  const syncApplies =
    syncSnapshot.tab === activeTab && syncSnapshot.registry.actions != null;

  if (syncApplies) {
    return (
      <div className="flex shrink-0 flex-wrap items-center justify-end gap-2 self-center">
        {syncSnapshot.registry.actions}
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
  const { activeTab } = useControlPanelChromeRegistryContext();
  const syncSnapshot = useControlPanelChromeSnapshot();
  const syncApplies =
    syncSnapshot.tab === activeTab && syncSnapshot.registry.toolbar != null;
  if (!syncApplies) return null;
  return (
    <div className={cn(pageChromeToolbarRowClass, "w-full")}>
      {syncSnapshot.registry.toolbar}
    </div>
  );
}
