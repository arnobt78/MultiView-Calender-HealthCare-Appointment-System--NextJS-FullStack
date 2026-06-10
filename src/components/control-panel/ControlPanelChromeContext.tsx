"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";

import type { ControlPanelSidebarTabValue } from "@/lib/control-panel-nav-config";

/** Sync-store slot shape — registered by ControlPanelChromeActions during body render. */
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
};

const ControlPanelChromeRegistryContext =
  createContext<ControlPanelChromeSlotContextValue | null>(null);

/** Wraps CP section body; merged header slots read sync store + defaultDescription/activeTab. */
export function ControlPanelChromeRegistryProvider({
  children,
  defaultDescription,
  activeTab,
}: {
  children: ReactNode;
  defaultDescription: string;
  activeTab: ControlPanelSidebarTabValue;
}) {
  const value = useMemo(
    () => ({ defaultDescription, activeTab }),
    [defaultDescription, activeTab]
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

/** True when rendered inside merged CP section shell (ControlPanelPageChrome registers sync slots). */
export function useControlPanelChromeFromServer() {
  return useContext(ControlPanelChromeRegistryContext) != null;
}
