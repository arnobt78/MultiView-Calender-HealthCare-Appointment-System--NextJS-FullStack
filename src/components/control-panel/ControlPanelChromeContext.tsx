"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  type ReactNode,
} from "react";

import type { ControlPanelSidebarTabValue } from "@/lib/control-panel-nav-config";
import { mergeControlPanelChromeRegistrySlice } from "@/lib/control-panel-chrome-registry-merge";

/** Live header slots — registered by ControlPanelChromeActions during body render. */
export type ControlPanelChromeRegistry = {
  actions: ReactNode | null;
  toolbar: ReactNode | null;
  description: ReactNode | null;
  title: ReactNode | null;
};

export const EMPTY_CONTROL_PANEL_CHROME_REGISTRY: ControlPanelChromeRegistry = {
  actions: null,
  toolbar: null,
  description: null,
  title: null,
};

type ControlPanelChromeSlotContextValue = {
  defaultDescription: string;
  activeTab: ControlPanelSidebarTabValue;
  /** Merge one section's slots during body render (same React tree — survives soft nav). */
  registerLiveSlice: (
    tab: ControlPanelSidebarTabValue,
    slice: Partial<ControlPanelChromeRegistry>
  ) => boolean;
  notifyLiveSlots: () => void;
  subscribeLiveSlots: (listener: () => void) => () => void;
  getLiveSlots: () => ControlPanelChromeRegistry;
};

const ControlPanelChromeRegistryContext =
  createContext<ControlPanelChromeSlotContextValue | null>(null);

/**
 * Provider-scoped live slots — avoids module singleton bleed where old route unmount
 * reset() wiped the new page's registered header actions after soft navigation.
 */
export function ControlPanelChromeRegistryProvider({
  children,
  defaultDescription,
  activeTab,
}: {
  children: ReactNode;
  defaultDescription: string;
  activeTab: ControlPanelSidebarTabValue;
}) {
  const liveSlotsRef = useRef<ControlPanelChromeRegistry>(EMPTY_CONTROL_PANEL_CHROME_REGISTRY);
  const listenersRef = useRef(new Set<() => void>());

  const subscribeLiveSlots = useCallback((listener: () => void) => {
    listenersRef.current.add(listener);
    return () => {
      listenersRef.current.delete(listener);
    };
  }, []);

  const getLiveSlots = useCallback(() => liveSlotsRef.current, []);

  const notifyLiveSlots = useCallback(() => {
    listenersRef.current.forEach((l) => l());
  }, []);

  const registerLiveSlice = useCallback(
    (tab: ControlPanelSidebarTabValue, slice: Partial<ControlPanelChromeRegistry>): boolean => {
      if (tab !== activeTab) return false;

      const next = mergeControlPanelChromeRegistrySlice(liveSlotsRef.current, slice);
      if (next == null) return false;

      liveSlotsRef.current = next;
      return true;
    },
    [activeTab]
  );

  const value = useMemo(
    () => ({
      defaultDescription,
      activeTab,
      registerLiveSlice,
      notifyLiveSlots,
      subscribeLiveSlots,
      getLiveSlots,
    }),
    [
      defaultDescription,
      activeTab,
      registerLiveSlice,
      notifyLiveSlots,
      subscribeLiveSlots,
      getLiveSlots,
    ]
  );

  return (
    <ControlPanelChromeRegistryContext.Provider value={value}>
      {children}
    </ControlPanelChromeRegistryContext.Provider>
  );
}

export function useControlPanelChromeRegistryContext() {
  const ctx = useContext(ControlPanelChromeRegistryContext);
  if (!ctx) {
    throw new Error(
      "ControlPanel chrome slots must be used within ControlPanelChromeRegistryProvider"
    );
  }
  return ctx;
}

/** True when rendered inside merged CP section shell (ControlPanelPageChrome registers live slots). */
export function useControlPanelChromeFromServer() {
  return useContext(ControlPanelChromeRegistryContext) != null;
}
