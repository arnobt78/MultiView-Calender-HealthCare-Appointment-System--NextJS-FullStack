"use client";

import { createContext, useContext } from "react";

/** When true, server-rendered chrome is above; client header renders actions only. */
const ControlPanelChromeFromServerContext = createContext(false);

export function ControlPanelChromeFromServerProvider({
  children,
  value = true,
}: {
  children: React.ReactNode;
  value?: boolean;
}) {
  return (
    <ControlPanelChromeFromServerContext.Provider value={value}>
      {children}
    </ControlPanelChromeFromServerContext.Provider>
  );
}

export function useControlPanelChromeFromServer() {
  return useContext(ControlPanelChromeFromServerContext);
}
