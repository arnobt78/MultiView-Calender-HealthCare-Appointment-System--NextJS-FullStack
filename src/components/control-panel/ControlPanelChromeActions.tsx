"use client";

import { useLayoutEffect, type ReactNode } from "react";
import type { ControlPanelChromeRegistry } from "@/components/control-panel/ControlPanelChromeContext";
import { useControlPanelChromeRegistryContext } from "@/components/control-panel/ControlPanelChromeContext";
import type { ControlPanelSidebarTabValue } from "@/lib/control-panel-nav-config";

type ControlPanelChromeActionsProps = {
  tab: ControlPanelSidebarTabValue;
  actions?: ReactNode;
  toolbar?: ReactNode;
  description?: ReactNode;
  title?: ReactNode;
};

/**
 * Registers dynamic header slots synchronously during render (body must render before header).
 * Live slots live in provider scope — not the module singleton (old route unmount must not clear new tab).
 */
export function ControlPanelChromeActions({
  tab,
  actions,
  toolbar,
  description,
  title,
}: ControlPanelChromeActionsProps) {
  const { registerLiveSlice, notifyLiveSlots } = useControlPanelChromeRegistryContext();

  const slice: Partial<ControlPanelChromeRegistry> = {};
  if (actions !== undefined) slice.actions = actions;
  if (toolbar !== undefined) slice.toolbar = toolbar;
  if (description !== undefined) slice.description = description;
  if (title !== undefined) slice.title = title;

  if (Object.keys(slice).length > 0) {
    registerLiveSlice(tab, slice);
  }

  useLayoutEffect(() => {
    if (Object.keys(slice).length === 0) return;
    registerLiveSlice(tab, slice);
    notifyLiveSlots();
  });

  return null;
}
