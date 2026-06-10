"use client";

import { useLayoutEffect, type ReactNode } from "react";
import type { ControlPanelChromeRegistry } from "@/components/control-panel/ControlPanelChromeContext";
import {
  registerControlPanelChromeSlice,
  resetControlPanelChromeRegistry,
  notifyControlPanelChromeRegistry,
} from "@/lib/control-panel-chrome-sync-store";

type ControlPanelChromeActionsProps = {
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
    registerControlPanelChromeSlice(slice);
  }

  useLayoutEffect(() => {
    notifyControlPanelChromeRegistry();
    return () => resetControlPanelChromeRegistry();
  }, [actions, toolbar, description, title]);

  return null;
}
