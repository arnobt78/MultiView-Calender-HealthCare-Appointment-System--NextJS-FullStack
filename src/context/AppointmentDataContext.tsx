"use client";

import { createContext, useContext, useMemo } from "react";
import { useAppointments } from "@/hooks/useAppointments";
import {
  buildDailyStatsMap,
  summarizeAppointments,
  type AppointmentSummaryStats,
  type DailyAppointmentStats,
} from "@/lib/appointment-stats";

type AppointmentDataContextValue = ReturnType<typeof useAppointments> & {
  summaryStats: AppointmentSummaryStats;
  dailyStatsMap: Record<string, DailyAppointmentStats>;
};

const AppointmentDataContext = createContext<AppointmentDataContextValue | null>(
  null
);

export function AppointmentDataProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const appointmentData = useAppointments();
  const appointments = appointmentData.appointments;

  const summaryStats = useMemo(
    () => summarizeAppointments(appointments),
    [appointments]
  );

  const dailyStatsMap = useMemo(
    () => buildDailyStatsMap(appointments),
    [appointments]
  );

  const value = useMemo(
    () => ({
      ...appointmentData,
      summaryStats,
      dailyStatsMap,
    }),
    [appointmentData, summaryStats, dailyStatsMap]
  );

  return (
    <AppointmentDataContext.Provider value={value}>
      {children}
    </AppointmentDataContext.Provider>
  );
}

export function useAppointmentData() {
  const ctx = useContext(AppointmentDataContext);
  if (!ctx) {
    throw new Error("useAppointmentData must be used inside AppointmentDataProvider");
  }
  return ctx;
}
