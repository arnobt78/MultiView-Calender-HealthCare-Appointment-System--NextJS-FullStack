"use client";

import { createContext, useContext } from "react";

/**
 * SSR-seeded role for navbar link chrome — set in root layout from session + DB role
 * so server HTML matches the first client paint (no localStorage branch during render).
 */
const NavRoleContext = createContext<string | null>(null);

export function NavRoleProvider({
  role,
  children,
}: {
  role: string | null;
  children: React.ReactNode;
}) {
  return <NavRoleContext.Provider value={role}>{children}</NavRoleContext.Provider>;
}

export function useInitialNavRole(): string | null {
  return useContext(NavRoleContext);
}
