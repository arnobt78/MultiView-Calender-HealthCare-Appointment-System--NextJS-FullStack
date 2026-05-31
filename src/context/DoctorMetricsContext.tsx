"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import type { User } from "@/types/types";
import type { DoctorDirectoryRow } from "@/lib/doctor-directory";
import type { DoctorListMetrics } from "@/hooks/useDoctorListMetrics";

export type DoctorMetricRow = User & { directory?: DoctorDirectoryRow };

export type DoctorMetricsContextValue = {
  rows: DoctorMetricRow[];
  metrics: DoctorListMetrics;
  isLoading: boolean;
  isFetching: boolean;
  listBodyLoading: boolean;
};

const DoctorMetricsContext = createContext<DoctorMetricsContextValue | null>(null);

export function DoctorMetricsProvider({
  value,
  children,
}: {
  value: DoctorMetricsContextValue;
  children: ReactNode;
}) {
  const memo = useMemo(
    () => ({
      rows: value.rows,
      metrics: value.metrics,
      isLoading: value.isLoading,
      isFetching: value.isFetching,
      listBodyLoading: value.listBodyLoading,
    }),
    [value.rows, value.metrics, value.isLoading, value.isFetching, value.listBodyLoading]
  );
  return <DoctorMetricsContext.Provider value={memo}>{children}</DoctorMetricsContext.Provider>;
}

export function useDoctorMetricsContext() {
  const ctx = useContext(DoctorMetricsContext);
  if (!ctx) {
    throw new Error("useDoctorMetricsContext requires DoctorMetricsProvider");
  }
  return ctx;
}
