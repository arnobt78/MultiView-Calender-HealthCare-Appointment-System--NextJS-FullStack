"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import type { Patient } from "@/types/types";
import type { PatientListMetrics } from "@/hooks/usePatientListMetrics";

/** Snapshot for stat cards + any child that should read live list metrics without prop drilling */
export type PatientMetricsContextValue = {
  patients: Patient[];
  metrics: PatientListMetrics;
  /** First load — no successful list yet */
  isLoading: boolean;
  isFetching: boolean;
  /**
   * True while the list UI should show loading placeholders (stat skeletons + table body skeletons).
   * Includes “not yet mounted on the client” so SSR and the first client paint match React Query
   * (avoids hydration mismatch when the client cache resolves before mount).
   */
  listBodyLoading: boolean;
};

const PatientMetricsContext = createContext<PatientMetricsContextValue | null>(null);

export function PatientMetricsProvider({
  value,
  children,
}: {
  value: PatientMetricsContextValue;
  children: ReactNode;
}) {
  const memo = useMemo(
    () => ({
      patients: value.patients,
      metrics: value.metrics,
      isLoading: value.isLoading,
      isFetching: value.isFetching,
      listBodyLoading: value.listBodyLoading,
    }),
    [value.patients, value.metrics, value.isLoading, value.isFetching, value.listBodyLoading]
  );
  return <PatientMetricsContext.Provider value={memo}>{children}</PatientMetricsContext.Provider>;
}

export function usePatientMetricsContext() {
  const ctx = useContext(PatientMetricsContext);
  if (!ctx) {
    throw new Error("usePatientMetricsContext requires PatientMetricsProvider");
  }
  return ctx;
}
