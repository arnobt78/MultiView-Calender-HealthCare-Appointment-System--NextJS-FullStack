/**
 * Appointment detail API payload — shared by GET/PATCH/PUT and client refetch.
 * Keeps `appointment` (list/calendar shape) + `detail` (entity detail view-model) in sync.
 */
import {
  APPOINTMENT_TYPE_CARD_SELECT,
  appointmentTypeSerializedFields,
} from "@/lib/appointment-type-include";
import {
  resolveAppointmentAccess,
  type AppointmentAccessSession,
  type AppointmentDetailRaw,
} from "@/lib/appointment-access";
import { buildAppointmentDetailViewModel } from "@/lib/appointment-detail-view-model";
import type { AppointmentDetailViewModel } from "@/lib/appointment-detail-view-model";
import type { EntityRole } from "@/lib/entity-routes";
import { serializeAppointment } from "@/lib/serializers";
import type { Appointment } from "@/types/types";

export type AppointmentDetailApiPayload = {
  appointment: Appointment;
  detail: AppointmentDetailViewModel;
};

/** Cross-tab + cache-first write — detail optional when API returns list row only (patient booking). */
export type AppointmentCrossTabMergePayload = {
  appointment: Appointment;
  detail?: AppointmentDetailViewModel;
};

export type AppointmentWritePayload =
  | AppointmentDetailApiPayload
  | AppointmentCrossTabMergePayload;

function serializeAppointmentFromDetailRaw(raw: AppointmentDetailRaw): Appointment {
  const feeDoc = raw as AppointmentDetailRaw & {
    treating_physician?: { consultation_fee: number | null } | null;
    owner?: { consultation_fee: number | null } | null;
    appointment_type?: {
      price_cents: number;
      name?: string | null;
      duration_minutes?: number | null;
    } | null;
  };
  return serializeAppointment({
    ...raw,
    ...appointmentTypeSerializedFields(feeDoc.appointment_type),
    doctor_consultation_fee_cents:
      feeDoc.treating_physician?.consultation_fee ?? feeDoc.owner?.consultation_fee ?? null,
  });
}

/** Build GET/PATCH response — null when access denied or row missing. */
export async function buildAppointmentDetailApiPayload(
  session: AppointmentAccessSession,
  appointmentId: string
): Promise<AppointmentDetailApiPayload | null> {
  const { level, raw } = await resolveAppointmentAccess(session, appointmentId);
  if (level === "none" || !raw) return null;

  const viewerRole = (session.role ?? "patient") as EntityRole;
  return {
    appointment: serializeAppointmentFromDetailRaw(raw),
    detail: buildAppointmentDetailViewModel(raw, viewerRole, level),
  };
}
