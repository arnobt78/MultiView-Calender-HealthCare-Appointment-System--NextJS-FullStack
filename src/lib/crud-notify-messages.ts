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

function formatBookingRange(start: string | Date, end: string | Date): string | null {
  const startDate = start instanceof Date ? start : new Date(start);
  const endDate = end instanceof Date ? end : new Date(end);
  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
    return null;
  }
  return `${format(startDate, "dd MMM yyyy")}, ${format(startDate, "HH:mm")}–${format(endDate, "HH:mm")}`;
}

/** Matches CP invoice table (`amount / 100`, `de-DE`). */
export function formatInvoiceMoney(params: {
  amount: number;
  currency?: string;
  unit: "cents" | "eur";
}): string {
  const currency = (params.currency ?? "eur").toUpperCase();
  const value = params.unit === "cents" ? params.amount / 100 : params.amount;
  return value.toLocaleString("de-DE", { style: "currency", currency });
}

export type InvoiceCrudNotifyInput = {
  label: string;
  amountFormatted?: string;
};

/** Invoice Management — description + formatted amount when available. */
export function invoiceCrudMessage(
  action: CrudNotifyAction,
  input: InvoiceCrudNotifyInput
): CrudNotifyPayload {
  const quoted = quoteName(input.label);
  const entity = "Invoice";
  const moneySuffix = input.amountFormatted ? ` (${input.amountFormatted})` : "";

  if (action === "created") {
    return {
      action,
      entity,
      detail: `${quoted}${moneySuffix} ready for payment.`,
    };
  }
  return {
    action: "deleted",
    entity,
    detail: `${quoted}${moneySuffix} removed.`,
  };
}

/** Organization Management — org name on create/delete. */
export function organizationCrudMessage(
  action: CrudNotifyAction,
  params: { name: string }
): CrudNotifyPayload {
  const quoted = quoteName(params.name);
  const entity = "Organization";
  if (action === "created") {
    return { action, entity, detail: `${quoted} created.` };
  }
  return { action: "deleted", entity, detail: `${quoted} deleted.` };
}

/** Organization member add/remove — member, org, optional role. */
export function orgMemberCrudMessage(
  action: CrudNotifyAction,
  params: { orgName: string; memberLabel: string; role?: string }
): CrudNotifyPayload {
  const member = quoteName(params.memberLabel);
  const org = quoteName(params.orgName);
  const entity = "Member";
  const roleSuffix = params.role?.trim() ? ` as ${params.role.trim()}` : "";

  if (action === "created") {
    return { action, entity, detail: `${member} added to ${org}${roleSuffix}.` };
  }
  return { action, entity, detail: `${member} removed from ${org}.` };
}

/** Bulk mark-all-read — count from query cache snapshot before invalidate. */
export function notificationsMarkAllReadMessage(params: { count: number }): CrudNotifyPayload {
  const n = Math.max(0, params.count);
  const detail =
    n === 0
      ? "No unread notifications to mark."
      : n === 1
        ? "1 notification marked as read."
        : `${n} notifications marked as read.`;
  return { action: "updated", entity: "Notifications", detail };
}

/** Bulk delete-read — count from API `deleted` field. */
export function notificationsDeleteReadMessage(params: { deleted: number }): CrudNotifyPayload {
  const n = Math.max(0, params.deleted);
  const detail =
    n === 0
      ? "No read notifications to remove."
      : n === 1
        ? "1 read notification removed."
        : `${n} read notifications removed.`;
  return { action: "deleted", entity: "Read notifications", detail };
}

/** Patient booking wizard confirm — doctor, visit type, optional slot from mutation payload. */
export function patientBookingCreatedMessage(params: {
  doctorName: string;
  typeName: string;
  start?: string | Date;
  end?: string | Date;
}): CrudNotifyPayload {
  const doctor = params.doctorName.trim() || "your doctor";
  const type = params.typeName.trim() || "Appointment";
  const entity = "Appointment request";

  if (params.start != null && params.end != null) {
    const slot = formatBookingRange(params.start, params.end);
    if (slot) {
      return {
        action: "created",
        entity,
        detail: `With ${doctor} · ${type} · ${slot}.`,
      };
    }
  }

  return {
    action: "created",
    entity,
    detail: `With ${doctor} · ${type}.`,
  };
}

/** Global template CRUD (CP admin editor) — name + duration from API row. */
export function globalVisitTypeCrudMessage(
  action: CrudNotifyAction,
  params: { name: string; duration_minutes?: number }
): CrudNotifyPayload {
  const quoted = quoteName(params.name);
  const entity = "Appointment type template";
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
