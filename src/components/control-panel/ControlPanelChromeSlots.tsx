"use client";

import { cn } from "@/lib/utils";
import {
  pageChromeToolbarRowClass,
  pageHeaderDescriptionClass,
} from "@/lib/page-chrome-classes";
import { useControlPanelChromeRegistryContext } from "@/components/control-panel/ControlPanelChromeContext";

/** Default or section-overridden subtitle — sits in merged header left stack. */
export function ControlPanelChromeDescriptionSlot() {
  const { registry, defaultDescription } = useControlPanelChromeRegistryContext();
  const description = registry.description ?? defaultDescription;
  if (!description) return null;
  return <div className={pageHeaderDescriptionClass}>{description}</div>;
}

/** Right column of merged header — action buttons from section registry. */
export function ControlPanelChromeActionsSlot() {
  const { registry } = useControlPanelChromeRegistryContext();
  if (!registry.actions) return null;
  return (
    <div className="flex shrink-0 flex-wrap items-center justify-end gap-2 self-center">
      {registry.actions}
    </div>
  );
}

/** Optional second row under title/actions (filters, export toolbar). */
export function ControlPanelChromeToolbarSlot() {
  const { registry } = useControlPanelChromeRegistryContext();
  if (!registry.toolbar) return null;
  return <div className={cn(pageChromeToolbarRowClass, "w-full")}>{registry.toolbar}</div>;
}
