"use client";

import { isSameDay } from "date-fns";
import type { FullAppointment } from "@/hooks/useAppointments";

export type AppointmentSummaryStats = {
  total: number;
  today: number;
  nextDay: number;
  later: number;
  passed: number;
  open: number;
  alert: number;
  done: number;
  cancelled: number;
};

/** Per-day / per-scope status buckets — pending→open; cancelled is separate (not open). */
export type DailyAppointmentStats = {
  total: number;
  open: number;
  alert: number;
  done: number;
  cancelled: number;
};

export function dateKey(input: Date): string {
  const d = new Date(input);
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

export function summarizeAppointments(
  appointments: FullAppointment[],
  baseDate = new Date()
): AppointmentSummaryStats {
  const normalizedBase = new Date(baseDate);
  normalizedBase.setHours(0, 0, 0, 0);

  return appointments.reduce<AppointmentSummaryStats>(
    (acc, appt) => {
      const start = new Date(appt.start);
      const startDay = new Date(start);
      startDay.setHours(0, 0, 0, 0);
      const dayDiff = Math.floor(
        (startDay.getTime() - normalizedBase.getTime()) / (1000 * 60 * 60 * 24)
      );

      acc.total += 1;
      if (dayDiff === 0 || isSameDay(startDay, normalizedBase)) acc.today += 1;
      else if (dayDiff === 1) acc.nextDay += 1;
      else if (dayDiff > 1) acc.later += 1;
      else acc.passed += 1;

      if (appt.status === "done") acc.done += 1;
      else if (appt.status === "alert") acc.alert += 1;
      else if (appt.status === "cancelled") acc.cancelled += 1;
      else acc.open += 1;

      return acc;
    },
    {
      total: 0,
      today: 0,
      nextDay: 0,
      later: 0,
      passed: 0,
      open: 0,
      alert: 0,
      done: 0,
      cancelled: 0,
    }
  );
}

export function summarizeDayAppointments(
  appointments: FullAppointment[]
): DailyAppointmentStats {
  return appointments.reduce<DailyAppointmentStats>(
    (acc, appt) => {
      acc.total += 1;
      if (appt.status === "done") acc.done += 1;
      else if (appt.status === "alert") acc.alert += 1;
      else if (appt.status === "cancelled") acc.cancelled += 1;
      else acc.open += 1;
      return acc;
    },
    { total: 0, open: 0, alert: 0, done: 0, cancelled: 0 }
  );
}
