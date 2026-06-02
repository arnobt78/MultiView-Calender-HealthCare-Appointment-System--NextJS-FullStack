/**
 * Dynamic copy for `ConfirmActionDialog` destructive confirms — shared calendar + billing + visit types.
 */

import type { ReactNode } from "react";
import { formatInvoiceMoney } from "@/lib/crud-notify-messages";
import { getInvoiceAppointmentTitle } from "@/lib/invoice-list-row-display";
import { formatCentsToPriceInput } from "@/lib/appointment-type-price";
import type { InvoiceRow } from "@/lib/billing-types";
import {
  formatTimeOffRangeLabel,
  minsToTime,
  WEEKDAY_LABELS,
} from "@/lib/doctor-schedule-display";
import type {
  AvailabilityWindow,
  DoctorSettingsVariant,
  TimeOffBlock,
} from "@/lib/doctor-schedule-types";

export const DELETE_INVOICE_CONFIRM_TITLE = "Delete invoice?";
export const DELETE_APPOINTMENT_TYPE_CONFIRM_TITLE = "Delete appointment type?";
export const DELETE_WEEKLY_HOURS_WINDOW_CONFIRM_TITLE = "Delete weekly hours window?";
export const DELETE_UNAVAILABLE_DATE_CONFIRM_TITLE = "Delete unavailable date?";
export const DISABLE_VISIT_TYPE_CONFIRM_TITLE = "Disable visit type?";
/** @deprecated Use `DISABLE_VISIT_TYPE_CONFIRM_TITLE` */
export const DISABLE_GLOBAL_VISIT_TYPE_CONFIRM_TITLE = DISABLE_VISIT_TYPE_CONFIRM_TITLE;

/** Invoice list/detail delete — visit + patient + amount when available. */
export function buildInvoiceDeleteConfirmSubtitle(
  invoice: Pick<
    InvoiceRow,
    "id" | "amount" | "currency" | "status" | "description" | "visit_summary"
  >
): ReactNode {
  const visitTitle = getInvoiceAppointmentTitle(invoice);
  const patient = invoice.visit_summary?.patient_label?.trim();
  const amount = formatInvoiceMoney({
    amount: invoice.amount,
    currency: invoice.currency,
    unit: "cents",
  });
  const shortId = invoice.id.slice(0, 8);

  return (
    <>
      This will permanently delete invoice{" "}
      <span className="font-medium text-gray-800">#{shortId}</span>
      {invoice.status ? (
        <>
          {" "}
          (<span className="font-medium text-gray-800">{invoice.status}</span>)
        </>
      ) : null}
      .
      <br />
      <span className="font-medium text-gray-800">{visitTitle}</span>
      {patient ? (
        <>
          {" "}
          for <span className="font-medium text-gray-800">{patient}</span>
        </>
      ) : null}{" "}
      — <span className="font-medium text-gray-800">{amount}</span>. This cannot be undone.
    </>
  );
}

type AppointmentTypeDeleteInput = {
  name: string;
  duration_minutes: number;
  price_cents?: number;
};

/** Doctor-owned visit type row delete — name, duration, optional fee. */
export function buildAppointmentTypeDeleteConfirmSubtitle(
  type: AppointmentTypeDeleteInput
): ReactNode {
  const fee =
    (type.price_cents ?? 0) > 0
      ? formatCentsToPriceInput(type.price_cents ?? 0)
      : null;

  return (
    <>
      This will permanently remove{" "}
      <span className="font-medium text-gray-800">{type.name.trim()}</span>
      {" "}
      (<span className="font-medium text-gray-800">{type.duration_minutes} min</span>
      {fee ? (
        <>
          , <span className="font-medium text-gray-800">€{fee}</span>
        </>
      ) : null}
      ) from your practice. Patients will no longer book this visit type.
    </>
  );
}

function formatWeeklyWindowLabel(window: Pick<AvailabilityWindow, "weekday" | "start_min" | "end_min" | "timezone">): string {
  const day = WEEKDAY_LABELS[window.weekday] ?? `Day ${window.weekday}`;
  const range = `${minsToTime(window.start_min)} – ${minsToTime(window.end_min)}`;
  const tz = window.timezone?.trim();
  return tz ? `${day}, ${range} (${tz})` : `${day}, ${range}`;
}

/** Weekly Hours row delete — weekday + time range (+ timezone when set). */
export function buildWeeklyHoursWindowDeleteConfirmSubtitle(
  window: Pick<AvailabilityWindow, "weekday" | "start_min" | "end_min" | "timezone">
): ReactNode {
  const label = formatWeeklyWindowLabel(window);
  return (
    <>
      This will permanently remove{" "}
      <span className="font-medium text-gray-800">{label}</span> from your weekly hours.
      Existing appointments are not changed, but new bookings will no longer use this window.
    </>
  );
}

/** Unavailable Dates row delete — datetime range + optional reason. */
export function buildUnavailableDateDeleteConfirmSubtitle(
  block: Pick<TimeOffBlock, "starts_at" | "ends_at" | "reason">
): ReactNode {
  const range = formatTimeOffRangeLabel(block.starts_at, block.ends_at);
  const reason = block.reason?.trim();
  return (
    <>
      This will permanently remove the unavailable block{" "}
      <span className="font-medium text-gray-800">{range}</span>
      {reason ? (
        <>
          {" "}
          (<span className="font-medium text-gray-800">{reason}</span>)
        </>
      ) : null}
      . Patients will be able to book during this period again.
    </>
  );
}

type GlobalVisitTypeDisableInput = {
  name: string;
  duration_minutes: number;
  is_telehealth?: boolean;
};

/** Global-for-all-doctors checkbox uncheck — warn before `is_enabled: false`. */
export function buildDisableGlobalVisitTypeConfirmSubtitle(
  type: GlobalVisitTypeDisableInput,
  variant: DoctorSettingsVariant = "portal"
): ReactNode {
  const tele = type.is_telehealth ? " · Telehealth" : "";
  const bookingImpact =
    variant === "portal"
      ? "Your patients will no longer be able to book this visit type."
      : "This doctor will no longer offer this visit type for new bookings.";

  return (
    <>
      Disable{" "}
      <span className="font-medium text-gray-800">{type.name.trim()}</span>
      {" "}
      (<span className="font-medium text-gray-800">{type.duration_minutes} min</span>
      {tele ? (
        <span className="font-medium text-gray-800">{tele}</span>
      ) : null}
      )? {bookingImpact} You can turn it back on anytime.
    </>
  );
}

type OwnedVisitTypeDisableInput = {
  name: string;
  duration_minutes: number;
  price_cents?: number;
};

/** Doctor-owned visit type checkbox uncheck — warn before PATCH `is_active: false`. */
export function buildDisableOwnedVisitTypeConfirmSubtitle(
  type: OwnedVisitTypeDisableInput,
  variant: DoctorSettingsVariant = "portal"
): ReactNode {
  const fee =
    (type.price_cents ?? 0) > 0
      ? formatCentsToPriceInput(type.price_cents ?? 0)
      : null;
  const bookingImpact =
    variant === "portal"
      ? "Your patients will no longer be able to book this custom visit type."
      : "This custom visit type will be hidden from this doctor's booking options.";

  return (
    <>
      Disable{" "}
      <span className="font-medium text-gray-800">{type.name.trim()}</span>
      {" "}
      (<span className="font-medium text-gray-800">{type.duration_minutes} min</span>
      {fee ? (
        <>
          , <span className="font-medium text-gray-800">€{fee}</span>
        </>
      ) : null}
      )? {bookingImpact} You can turn it back on anytime.
    </>
  );
}
