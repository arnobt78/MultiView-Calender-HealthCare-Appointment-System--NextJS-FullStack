/**
 * Shared query parsing for GET /api/availability/dates and /slots (routes + Vitest).
 */

import { isValidUUID } from "@/lib/validation";
import { isFlexDurationMinutes } from "@/lib/scheduling/flexible-type-config";
import type { SchedulingScopeKey } from "@/lib/scheduling/scheduling-types";

const ISO_MONTH = /^\d{4}-\d{2}$/;
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

export type ParsedAvailabilityDatesQuery =
  | {
      ok: true;
      doctorId: string;
      monthYm: string;
      schedulingScope: SchedulingScopeKey;
      excludeAppointmentId?: string;
    }
  | { ok: false; error: string; status: 400 };

export type ParsedAvailabilitySlotsQuery =
  | {
      ok: true;
      doctorId: string;
      dateStr: string;
      typeId: string;
      excludeAppointmentId?: string;
    }
  | { ok: false; error: string; status: 400 };

function parseExcludeAppointmentId(raw: string | null): string | undefined {
  return raw && isValidUUID(raw) ? raw : undefined;
}

export function parseAvailabilityDatesQuery(
  searchParams: URLSearchParams
): ParsedAvailabilityDatesQuery {
  const doctorId = searchParams.get("doctorId") ?? "";
  const monthYm = searchParams.get("month") ?? "";
  const typeId = searchParams.get("typeId") ?? "";
  const flexRaw = searchParams.get("flexDurationMinutes");
  const flexMinutes = flexRaw != null ? Number(flexRaw) : NaN;
  const hasTypeId = Boolean(typeId);
  const hasFlex = flexRaw != null && flexRaw !== "";

  if (!isValidUUID(doctorId) || !ISO_MONTH.test(monthYm)) {
    return {
      ok: false,
      status: 400,
      error: "doctorId (UUID), month (YYYY-MM) are required",
    };
  }

  if (hasTypeId && hasFlex) {
    return {
      ok: false,
      status: 400,
      error: "Provide typeId or flexDurationMinutes, not both",
    };
  }

  if (!hasTypeId && !hasFlex) {
    return {
      ok: false,
      status: 400,
      error: "typeId or flexDurationMinutes (15|30|45|60) is required",
    };
  }

  if (hasTypeId) {
    if (!isValidUUID(typeId)) {
      return { ok: false, status: 400, error: "typeId must be a valid UUID" };
    }
    return {
      ok: true,
      doctorId,
      monthYm,
      schedulingScope: { kind: "type", typeId },
      excludeAppointmentId: parseExcludeAppointmentId(
        searchParams.get("excludeAppointmentId")
      ),
    };
  }

  if (!isFlexDurationMinutes(flexMinutes)) {
    return {
      ok: false,
      status: 400,
      error: "flexDurationMinutes must be 15, 30, 45, or 60",
    };
  }

  return {
    ok: true,
    doctorId,
    monthYm,
    schedulingScope: { kind: "flex", durationMinutes: flexMinutes },
    excludeAppointmentId: parseExcludeAppointmentId(
      searchParams.get("excludeAppointmentId")
    ),
  };
}

export function parseAvailabilitySlotsQuery(
  searchParams: URLSearchParams
): ParsedAvailabilitySlotsQuery {
  const doctorId = searchParams.get("doctorId") ?? "";
  const dateStr = searchParams.get("date") ?? "";
  const typeId = searchParams.get("typeId") ?? "";

  if (!isValidUUID(doctorId) || !isValidUUID(typeId) || !ISO_DATE.test(dateStr)) {
    return {
      ok: false,
      status: 400,
      error: "doctorId, date (YYYY-MM-DD), and typeId (UUID) are required",
    };
  }

  return {
    ok: true,
    doctorId,
    dateStr,
    typeId,
    excludeAppointmentId: parseExcludeAppointmentId(
      searchParams.get("excludeAppointmentId")
    ),
  };
}
