"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import type { Organization } from "@/hooks/useOrganization";
import type { OrganizationListMetrics } from "@/hooks/useOrganizationListMetrics";

export type OrganizationMetricsContextValue = {
  organizations: Organization[];
  metrics: OrganizationListMetrics;
  isLoading: boolean;
  listBodyLoading: boolean;
};

const OrganizationMetricsContext = createContext<OrganizationMetricsContextValue | null>(null);

export function OrganizationMetricsProvider({
  value,
  children,
}: {
  value: OrganizationMetricsContextValue;
  children: ReactNode;
}) {
  const memo = useMemo(
    () => ({
      organizations: value.organizations,
      metrics: value.metrics,
      isLoading: value.isLoading,
      listBodyLoading: value.listBodyLoading,
    }),
    [
      value.organizations,
      value.metrics,
      value.isLoading,
      value.listBodyLoading,
    ]
  );
  return (
    <OrganizationMetricsContext.Provider value={memo}>
      {children}
    </OrganizationMetricsContext.Provider>
  );
}

export function useOrganizationMetricsContext() {
  const ctx = useContext(OrganizationMetricsContext);
  if (!ctx) {
    throw new Error("useOrganizationMetricsContext requires OrganizationMetricsProvider");
  }
  return ctx;
}
