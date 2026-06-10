/**
 * Legacy module singleton — kept for unit tests (C12.1 tab isolation).
 * Live CP merged-header slots use provider-scoped registry in ControlPanelChromeContext.
 */

import type { ControlPanelChromeRegistry } from "@/components/control-panel/ControlPanelChromeContext";
import { EMPTY_CONTROL_PANEL_CHROME_REGISTRY } from "@/components/control-panel/ControlPanelChromeContext";
import type { ControlPanelSidebarTabValue } from "@/lib/control-panel-nav-config";

type Listener = () => void;

/** Live snapshot plus owning tab — slots ignore sync data when tab !== activeTab. */
export type ControlPanelChromeSyncSnapshot = {
  tab: ControlPanelSidebarTabValue | null;
  registry: ControlPanelChromeRegistry;
};

const EMPTY_SYNC_SNAPSHOT: ControlPanelChromeSyncSnapshot = {
  tab: null,
  registry: EMPTY_CONTROL_PANEL_CHROME_REGISTRY,
};

let activeTab: ControlPanelSidebarTabValue | null = null;
let snapshot: ControlPanelChromeSyncSnapshot = EMPTY_SYNC_SNAPSHOT;
const listeners = new Set<Listener>();

function emit() {
  listeners.forEach((l) => l());
}

export function getControlPanelChromeSnapshot(): ControlPanelChromeSyncSnapshot {
  return snapshot;
}

export function getControlPanelChromeServerSnapshot(): ControlPanelChromeSyncSnapshot {
  return getControlPanelChromeSnapshot();
}

export function subscribeControlPanelChrome(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function setControlPanelChromeActiveTab(tab: ControlPanelSidebarTabValue): void {
  if (activeTab === tab) return;
  activeTab = tab;
  snapshot = EMPTY_SYNC_SNAPSHOT;
}

export function reinitializeControlPanelChromeTab(tab: ControlPanelSidebarTabValue): void {
  activeTab = tab;
  snapshot = EMPTY_SYNC_SNAPSHOT;
}

export function registerControlPanelChromeSlice(
  tab: ControlPanelSidebarTabValue,
  slice: Partial<ControlPanelChromeRegistry>
): void {
  if (activeTab !== tab) return;

  const prev = snapshot.registry;
  const nextRegistry: ControlPanelChromeRegistry = {
    actions: slice.actions !== undefined ? slice.actions : prev.actions,
    toolbar: slice.toolbar !== undefined ? slice.toolbar : prev.toolbar,
    description:
      slice.description !== undefined ? slice.description : prev.description,
    title: slice.title !== undefined ? slice.title : prev.title,
  };

  const changed =
    nextRegistry.actions !== prev.actions ||
    nextRegistry.toolbar !== prev.toolbar ||
    nextRegistry.description !== prev.description ||
    nextRegistry.title !== prev.title;

  if (!changed) return;

  snapshot = { tab, registry: nextRegistry };
}

export function resetControlPanelChromeRegistry(): void {
  if (
    snapshot.registry.actions === null &&
    snapshot.registry.toolbar === null &&
    snapshot.registry.description === null &&
    snapshot.registry.title === null &&
    activeTab === null
  ) {
    return;
  }
  activeTab = null;
  snapshot = EMPTY_SYNC_SNAPSHOT;
  emit();
}

export function notifyControlPanelChromeRegistry(): void {
  emit();
}

/** @internal Test-only — reset module singleton between unit tests. */
export function __resetControlPanelChromeSyncStoreForTests(): void {
  activeTab = null;
  snapshot = EMPTY_SYNC_SNAPSHOT;
  listeners.clear();
}
