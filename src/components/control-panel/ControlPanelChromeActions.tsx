"use client";

import { useLayoutEffect, type ReactNode } from "react";
import {
  EMPTY_CONTROL_PANEL_CHROME_REGISTRY,
  useControlPanelChromeRegistryContext,
} from "@/components/control-panel/ControlPanelChromeContext";

type ControlPanelChromeActionsProps = {
  actions?: ReactNode;
  toolbar?: ReactNode;
  /** Overrides default SSR subtitle in merged header left stack. */
  description?: ReactNode;
  title?: ReactNode;
};

/**
 * Registers dynamic header slots — renders nothing in the section body.
 * Paired with slots in `ControlPanelSectionPageClient` merged sticky header.
 */
export function ControlPanelChromeActions({
  actions,
  toolbar,
  description,
  title,
}: ControlPanelChromeActionsProps) {
  const { setRegistry } = useControlPanelChromeRegistryContext();

  useLayoutEffect(() => {
    setRegistry({
      actions: actions ?? null,
      toolbar: toolbar ?? null,
      description: description ?? null,
      title: title ?? null,
    });
    return () => setRegistry(EMPTY_CONTROL_PANEL_CHROME_REGISTRY);
  }, [actions, toolbar, description, title, setRegistry]);

  return null;
}
