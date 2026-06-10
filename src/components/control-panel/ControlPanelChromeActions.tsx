"use client";

import { useLayoutEffect, type ReactNode } from "react";
import type { ControlPanelChromeRegistry } from "@/components/control-panel/ControlPanelChromeContext";
import type { ControlPanelSidebarTabValue } from "@/lib/control-panel-nav-config";
import {
  registerControlPanelChromeSlice,
  resetControlPanelChromeRegistry,
  notifyControlPanelChromeRegistry,
  getControlPanelChromeSnapshot,
} from "@/lib/control-panel-chrome-sync-store";

type ControlPanelChromeActionsProps = {
  tab: ControlPanelSidebarTabValue;
  actions?: ReactNode;
  toolbar?: ReactNode;
  description?: ReactNode;
  title?: ReactNode;
};

/**
 * Registers dynamic header slots synchronously during render (body must render before header).
 * Only passes defined props — omitting a slot preserves the previous snapshot value (no null clear).
 */
export function ControlPanelChromeActions({
  tab,
  actions,
  toolbar,
  description,
  title,
}: ControlPanelChromeActionsProps) {
  const slice: Partial<ControlPanelChromeRegistry> = {};
  if (actions !== undefined) slice.actions = actions;
  if (toolbar !== undefined) slice.toolbar = toolbar;
  if (description !== undefined) slice.description = description;
  if (title !== undefined) slice.title = title;

  if (Object.keys(slice).length > 0) {
    registerControlPanelChromeSlice(tab, slice);
  }

  // After commit — safe to notify header slots (isFetching, subtitle metric, etc.).
  useLayoutEffect(() => {
    if (Object.keys(slice).length > 0) {
      notifyControlPanelChromeRegistry();
    }
  });

  useLayoutEffect(() => {
    return () => {
      // Only clear on unmount / tab change — not when actions/description React nodes change identity.
      if (getControlPanelChromeSnapshot().tab === tab) {
        resetControlPanelChromeRegistry();
      }
    };
  }, [tab]);

  return null;
}
