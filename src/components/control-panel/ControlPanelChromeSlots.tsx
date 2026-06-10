"use client";

import { useSyncExternalStore, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import {
  pageChromeToolbarRowClass,
  pageHeaderDescriptionClass,
} from "@/lib/page-chrome-classes";
import {
  EMPTY_CONTROL_PANEL_CHROME_REGISTRY,
  useControlPanelChromeRegistryContext,
} from "@/components/control-panel/ControlPanelChromeContext";
import { ControlPanelChromeActionsShell } from "@/components/control-panel/ControlPanelChromeActionsShell";
import type { ControlPanelSidebarTabValue } from "@/lib/control-panel-nav-config";

function useLiveControlPanelChromeSlots() {
  const { subscribeLiveSlots, getLiveSlots } = useControlPanelChromeRegistryContext();
  useSyncExternalStore(subscribeLiveSlots, getLiveSlots, () => EMPTY_CONTROL_PANEL_CHROME_REGISTRY);
  return getLiveSlots();
}

/** Default or section-overridden subtitle — sits in merged header left stack. */
export function ControlPanelChromeDescriptionSlot() {
  const { defaultDescription } = useControlPanelChromeRegistryContext();
  const liveSlots = useLiveControlPanelChromeSlots();

  if (liveSlots.description != null) {
    return <>{liveSlots.description}</>;
  }

  if (!defaultDescription) return null;
  return <div className={pageHeaderDescriptionClass}>{defaultDescription}</div>;
}

type ActionsSlotProps = {
  tab: ControlPanelSidebarTabValue;
  /** SSR decorative shells — shown until live actions register. */
  serverChromeActions?: ReactNode;
};

/** Right column — live actions from provider-scoped registry. */
export function ControlPanelChromeActionsSlot({
  tab,
  serverChromeActions,
}: ActionsSlotProps) {
  const liveSlots = useLiveControlPanelChromeSlots();

  if (liveSlots.actions != null) {
    return (
      <div className="flex shrink-0 flex-wrap items-center justify-end gap-2 self-center">
        {liveSlots.actions}
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
  const liveSlots = useLiveControlPanelChromeSlots();
  if (liveSlots.toolbar == null) return null;
  return (
    <div className={cn(pageChromeToolbarRowClass, "w-full")}>
      {liveSlots.toolbar}
    </div>
  );
}
