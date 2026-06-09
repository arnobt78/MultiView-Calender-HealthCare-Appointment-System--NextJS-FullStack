"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

/** Client-registered chrome slots — rendered in merged header beside SSR static left. */
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

type RegistryContextValue = {
  registry: ControlPanelChromeRegistry;
  setRegistry: (next: ControlPanelChromeRegistry) => void;
  defaultDescription: string;
};

const ControlPanelChromeRegistryContext = createContext<RegistryContextValue | null>(
  null
);

/** @deprecated Use `ControlPanelChromeRegistryProvider`. */
export function ControlPanelChromeFromServerProvider({
  children,
}: {
  children: ReactNode;
  value?: boolean;
}) {
  return (
    <ControlPanelChromeRegistryProvider defaultDescription="">
      {children}
    </ControlPanelChromeRegistryProvider>
  );
}

/** Wraps CP section body; merged header slots read registered actions/toolbar/description. */
export function ControlPanelChromeRegistryProvider({
  children,
  defaultDescription,
}: {
  children: ReactNode;
  defaultDescription: string;
}) {
  const [registry, setRegistryState] = useState<ControlPanelChromeRegistry>(
    EMPTY_CONTROL_PANEL_CHROME_REGISTRY
  );
  const setRegistry = useCallback((next: ControlPanelChromeRegistry) => {
    setRegistryState(next);
  }, []);

  const value = useMemo(
    () => ({ registry, setRegistry, defaultDescription }),
    [registry, setRegistry, defaultDescription]
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

export function useControlPanelChromeRegistry() {
  return useControlPanelChromeRegistryContext().registry;
}

/** @deprecated Merged header registry replaces boolean chromeFromServer flag. */
export function useControlPanelChromeFromServer() {
  return useContext(ControlPanelChromeRegistryContext) != null;
}
