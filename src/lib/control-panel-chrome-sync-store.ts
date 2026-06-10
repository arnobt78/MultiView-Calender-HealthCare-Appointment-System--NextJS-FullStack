/**
 * Synchronous CP merged-header registry — sections register during render (external store)
 * so ActionsSlot reads populated actions in the same commit when body renders before header.
 */

import type { ControlPanelChromeRegistry } from "@/components/control-panel/ControlPanelChromeContext";
import { EMPTY_CONTROL_PANEL_CHROME_REGISTRY } from "@/components/control-panel/ControlPanelChromeContext";

type Listener = () => void;

let snapshot: ControlPanelChromeRegistry = EMPTY_CONTROL_PANEL_CHROME_REGISTRY;
const listeners = new Set<Listener>();

function emit() {
  listeners.forEach((l) => l());
}

export function getControlPanelChromeSnapshot(): ControlPanelChromeRegistry {
  return snapshot;
}

export function subscribeControlPanelChrome(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** Merge one section's slots into the live snapshot (called during section render). */
export function registerControlPanelChromeSlice(
  slice: Partial<ControlPanelChromeRegistry>
): void {
  snapshot = {
    actions: slice.actions !== undefined ? slice.actions : snapshot.actions,
    toolbar: slice.toolbar !== undefined ? slice.toolbar : snapshot.toolbar,
    description:
      slice.description !== undefined ? slice.description : snapshot.description,
    title: slice.title !== undefined ? slice.title : snapshot.title,
  };
}

export function resetControlPanelChromeRegistry(): void {
  if (
    snapshot.actions === null &&
    snapshot.toolbar === null &&
    snapshot.description === null &&
    snapshot.title === null
  ) {
    return;
  }
  snapshot = EMPTY_CONTROL_PANEL_CHROME_REGISTRY;
  emit();
}

/** Notify subscribers after a slice registration (same commit as body render). */
export function notifyControlPanelChromeRegistry(): void {
  emit();
}
