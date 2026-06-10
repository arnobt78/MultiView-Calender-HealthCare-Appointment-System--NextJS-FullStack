"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { ControlPanelSectionPrefetchPayload } from "@/lib/control-panel-section-prefetch";

const ControlPanelSectionInitialContext =
  createContext<ControlPanelSectionPrefetchPayload | null>(null);

/** SSR prefetch payload for active CP section — overview subtitle time, etc. */
export function ControlPanelSectionInitialProvider({
  initial,
  children,
}: {
  initial: ControlPanelSectionPrefetchPayload | null;
  children: ReactNode;
}) {
  return (
    <ControlPanelSectionInitialContext.Provider value={initial}>
      {children}
    </ControlPanelSectionInitialContext.Provider>
  );
}

export function useControlPanelSectionInitial() {
  return useContext(ControlPanelSectionInitialContext);
}
