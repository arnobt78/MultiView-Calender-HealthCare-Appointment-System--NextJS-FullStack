"use client";

import { createContext, useContext, useMemo } from "react";
import { useAppointments } from "@/hooks/useAppointments";
import {
  dateKey,
  summarizeAppointments,
  summarizeDayAppointments,
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

  const dailyStatsMap = useMemo(() => {
    const grouped: Record<string, typeof appointments> = {};
    for (const appt of appointments) {
      const key = dateKey(new Date(appt.start));
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(appt);
    }
    const statsMap: Record<string, DailyAppointmentStats> = {};
    Object.keys(grouped).forEach((key) => {
      statsMap[key] = summarizeDayAppointments(grouped[key]);
    });
    return statsMap;
  }, [appointments]);

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
