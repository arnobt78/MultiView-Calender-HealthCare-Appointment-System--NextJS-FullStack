/**
 * Single source for Sonner CRUD subtitles — pure builders consumed by `notify.crud` callers.
 * Reuses schedule display formatters; keep invalidation/cache logic in hooks unchanged.
 */

import { format } from "date-fns";
import {
  formatTimeOffRangeLabel,
  minsToTime,
  WEEKDAY_LABELS,
} from "@/lib/doctor-schedule-display";

export type CrudNotifyAction = "created" | "updated" | "deleted";

export type CrudNotifyPayload = {
  action: CrudNotifyAction;
  entity: string;
  detail: string;
};

export type WeeklyAvailabilityNotifyInput = {
  weekday: number;
  start_min: number;
  end_min: number;
  timezone?: string;
};

export type TimeOffNotifyInput = {
  starts_at: string;
  ends_at: string;
  reason?: string | null;
};

function quoteName(name: string): string {
  const trimmed = name.trim();
  return trimmed ? `"${trimmed}"` : "Visit type";
}

function formatWeeklyWindowLabel(input: WeeklyAvailabilityNotifyInput): string {
  const day = WEEKDAY_LABELS[input.weekday] ?? `Day ${input.weekday}`;
  const range = `${minsToTime(input.start_min)}–${minsToTime(input.end_min)}`;
  const tz = input.timezone?.trim();
  return tz ? `${day} ${range} (${tz})` : `${day} ${range}`;
}

function appendReasonSuffix(detail: string, reason?: string | null): string {
  const trimmed = reason?.trim();
  if (!trimmed) return detail;
  return `${detail} · "${trimmed}"`;
}

/** Weekly hours panel — day, time range, optional IANA zone. */
export function weeklyAvailabilityCrudMessage(
  action: CrudNotifyAction,
  input: WeeklyAvailabilityNotifyInput
): CrudNotifyPayload {
  const label = formatWeeklyWindowLabel(input);
  const entity = "Availability window";
  if (action === "created") {
    return { action, entity, detail: `${label} added to weekly hours.` };
  }
  if (action === "updated") {
    return { action, entity, detail: `${label} updated on weekly hours.` };
  }
  return { action, entity, detail: `${label} removed from weekly hours.` };
}

/** Unavailable dates panel — ISO range via `formatTimeOffRangeLabel`, optional reason. */
export function timeOffCrudMessage(
  action: CrudNotifyAction,
  input: TimeOffNotifyInput
): CrudNotifyPayload {
  const range = formatTimeOffRangeLabel(input.starts_at, input.ends_at);
  const entity = "Time off";
  if (action === "created") {
    return {
      action,
      entity,
      detail: appendReasonSuffix(`${range} added to your schedule.`, input.reason),
    };
  }
  if (action === "updated") {
    return {
      action,
      entity,
      detail: appendReasonSuffix(`${range} updated on your schedule.`, input.reason),
    };
  }
  return {
    action,
    entity,
    detail: appendReasonSuffix(`${range} removed from your schedule.`, input.reason),
  };
}

/** Global visit-type checkbox — always includes template name (portal + CP). */
export function globalVisitTypeToggleMessage(params: {
  name: string;
  enabled: boolean;
  variant?: "portal" | "control-panel";
}): CrudNotifyPayload {
  const quoted = quoteName(params.name);
  const entity = "Visit type";
  if (params.enabled) {
    const detail =
      params.variant === "portal"
        ? `${quoted} enabled for your patients.`
        : `${quoted} enabled for this doctor.`;
    return { action: "created", entity, detail };
  }
  const detail =
    params.variant === "portal"
      ? `${quoted} disabled for new bookings.`
      : `${quoted} disabled for this doctor.`;
  return { action: "deleted", entity, detail };
}

export type OwnedVisitTypeCrudInput =
  | { kind: "create"; name: string; duration_minutes: number }
  | { kind: "update"; name: string; duration_minutes?: number }
  | { kind: "delete"; name: string }
  | { kind: "toggle-active"; name: string; is_active: boolean };

/** Doctor-owned additional types — create/update/delete or `is_active` soft-hide. */
export function ownedVisitTypeCrudMessage(input: OwnedVisitTypeCrudInput): CrudNotifyPayload {
  const quoted = quoteName(input.name);
  const entity = "Appointment type";

  if (input.kind === "create") {
    return {
      action: "created",
      entity,
      detail: `${quoted} (${input.duration_minutes} min) saved for this doctor.`,
    };
  }
  if (input.kind === "delete") {
    return { action: "deleted", entity, detail: `${quoted} removed from this doctor.` };
  }
  if (input.kind === "toggle-active") {
    return {
      action: "updated",
      entity,
      detail: input.is_active
        ? `${quoted} enabled for new bookings.`
        : `${quoted} disabled for new bookings.`,
    };
  }
  const duration =
    input.duration_minutes != null ? ` (${input.duration_minutes} min)` : "";
  return {
    action: "updated",
    entity,
    detail: `${quoted}${duration} updated.`,
  };
}

/** Returns true when PATCH only toggles `is_active` (no rename/duration edit). */
export function isOwnedVisitTypeActiveOnlyPatch(
  patch: Partial<{ name: string; description: string | null; duration_minutes: number; is_active: boolean }>
): boolean {
  return (
    patch.is_active !== undefined &&
    patch.name === undefined &&
    patch.description === undefined &&
    patch.duration_minutes === undefined
  );
}

function formatBookingRange(start: string | Date, end: string | Date): string {
  const startDate = start instanceof Date ? start : new Date(start);
  const endDate = end instanceof Date ? end : new Date(end);
  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
    return "Date and time confirmed.";
  }
  return `${format(startDate, "dd MMM yyyy")}, ${format(startDate, "HH:mm")}–${format(endDate, "HH:mm")}`;
}

/** Patient booking wizard confirm — doctor, visit type, slot range. */
export function patientBookingCreatedMessage(params: {
  doctorName: string;
  typeName: string;
  start: string | Date;
  end: string | Date;
}): CrudNotifyPayload {
  const doctor = params.doctorName.trim() || "your doctor";
  const type = params.typeName.trim() || "Appointment";
  const slot = formatBookingRange(params.start, params.end);
  return {
    action: "created",
    entity: "Appointment request",
    detail: `With ${doctor} · ${type} · ${slot}.`,
  };
}

/** Global template CRUD (CP admin editor) — name + duration from API row. */
export function globalVisitTypeCrudMessage(
  action: CrudNotifyAction,
  params: { name: string; duration_minutes?: number }
): CrudNotifyPayload {
  const quoted = quoteName(params.name);
  const entity = "Global visit type";
  const duration =
    params.duration_minutes != null ? ` (${params.duration_minutes} min)` : "";
  if (action === "created") {
    return { action, entity, detail: `${quoted}${duration} saved for all doctors.` };
  }
  if (action === "updated") {
    return { action, entity, detail: `${quoted}${duration} updated.` };
  }
  return { action, entity, detail: `${quoted} removed from organization templates.` };
}
