"use client";

import { useLayoutEffect, type ReactNode } from "react";
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
 * useLayoutEffect notifies subscribers + clears on unmount.
 */
export function ControlPanelChromeActions({
  actions,
  toolbar,
  description,
  title,
}: ControlPanelChromeActionsProps) {
  registerControlPanelChromeSlice({
    actions: actions ?? null,
    toolbar: toolbar ?? null,
    description: description ?? null,
    title: title ?? null,
  });

  useLayoutEffect(() => {
    notifyControlPanelChromeRegistry();
    return () => resetControlPanelChromeRegistry();
  }, [actions, toolbar, description, title]);

  return null;
}
