import type { LucideIcon } from "lucide-react";
import {
  AlertCircle,
  Ban,
  CalendarCheck,
  CalendarClock,
} from "lucide-react";

/** Canonical appointment visit status — stored in `appointments.status`. */
export type AppointmentStatus = "pending" | "done" | "alert" | "cancelled";

export const APPOINTMENT_STATUSES: readonly AppointmentStatus[] = [
  "pending",
  "done",
  "alert",
  "cancelled",
] as const;

export type AppointmentStatusMeta = {
  status: AppointmentStatus;
  label: string;
  /** `calendar-glass-badge-*` token from globals.css */
  glassClass: string;
  Icon: LucideIcon;
};

const META: Record<AppointmentStatus, AppointmentStatusMeta> = {
  pending: {
    status: "pending",
    label: "Open",
    glassClass: "calendar-glass-badge-amber",
    Icon: CalendarClock,
  },
  done: {
    status: "done",
    label: "Done",
    glassClass: "calendar-glass-badge-emerald",
    Icon: CalendarCheck,
  },
  alert: {
    status: "alert",
    label: "Alert",
    glassClass: "calendar-glass-badge-rose",
    Icon: AlertCircle,
  },
  cancelled: {
    status: "cancelled",
    label: "Cancelled",
    glassClass: "calendar-glass-badge-slate",
    Icon: Ban,
  },
};

/** Normalize persisted / legacy status strings for UI + validation. */
export function normalizeAppointmentStatus(
  status: string | null | undefined
): AppointmentStatus {
  const key = status?.trim().toLowerCase();
  if (key === "done" || key === "alert" || key === "cancelled" || key === "pending") {
    return key;
  }
  return "pending";
}

export function resolveAppointmentStatusMeta(
  status: string | null | undefined
): AppointmentStatusMeta {
  return META[normalizeAppointmentStatus(status)];
}

export function isTerminalAppointmentStatus(status: string | null | undefined): boolean {
  const s = normalizeAppointmentStatus(status);
  return s === "done" || s === "cancelled";
}

export function isActiveAppointmentStatus(status: string | null | undefined): boolean {
  return !isTerminalAppointmentStatus(status);
}
