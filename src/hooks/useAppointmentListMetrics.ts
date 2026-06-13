import { useMemo } from "react";
import type { FullAppointment } from "@/hooks/useAppointments";
import { summarizeAppointments } from "@/lib/appointment-stats";

/** Stat-card counts for CP appointment-management — derived from cached list only. */
export type AppointmentListMetrics = {
  total: number;
  done: number;
  open: number;
  alert: number;
  cancelled: number;
};

export function useAppointmentListMetrics(
  appointments: FullAppointment[]
): AppointmentListMetrics {
  return useMemo(() => {
    const s = summarizeAppointments(appointments);
    return {
      total: s.total,
      done: s.done,
      open: s.open,
      alert: s.alert,
      cancelled: s.cancelled,
    };
  }, [appointments]);
}
