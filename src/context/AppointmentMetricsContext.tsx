"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import type { FullAppointment } from "@/hooks/useAppointments";
import type { AppointmentListMetrics } from "@/hooks/useAppointmentListMetrics";

export type AppointmentMetricsContextValue = {
  appointments: FullAppointment[];
  metrics: AppointmentListMetrics;
  isLoading: boolean;
  isFetching: boolean;
  listBodyLoading: boolean;
};

const AppointmentMetricsContext = createContext<AppointmentMetricsContextValue | null>(null);

export function AppointmentMetricsProvider({
  value,
  children,
}: {
  value: AppointmentMetricsContextValue;
  children: ReactNode;
}) {
  const memo = useMemo(
    () => ({
      appointments: value.appointments,
      metrics: value.metrics,
      isLoading: value.isLoading,
      isFetching: value.isFetching,
      listBodyLoading: value.listBodyLoading,
    }),
    [
      value.appointments,
      value.metrics,
      value.isLoading,
      value.isFetching,
      value.listBodyLoading,
    ]
  );
  return (
    <AppointmentMetricsContext.Provider value={memo}>
      {children}
    </AppointmentMetricsContext.Provider>
  );
}

export function useAppointmentMetricsContext() {
  const ctx = useContext(AppointmentMetricsContext);
  if (!ctx) {
    throw new Error("useAppointmentMetricsContext requires AppointmentMetricsProvider");
  }
  return ctx;
}
