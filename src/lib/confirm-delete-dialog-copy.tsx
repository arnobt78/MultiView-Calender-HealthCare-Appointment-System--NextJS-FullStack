/**
 * Dynamic copy for `ConfirmActionDialog` destructive confirms — shared calendar + billing + visit types.
 */

import type { ReactNode } from "react";
import { format } from "date-fns";
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
export const DELETE_APPOINTMENT_CONFIRM_TITLE = "Delete appointment?";
export const CANCEL_APPOINTMENT_CONFIRM_TITLE = "Cancel appointment?";

/** Cancel visit confirm — dynamic title + range (REQ-0113). */
export function buildAppointmentCancelConfirmTitle(title: string): string {
  const trimmed = title.trim();
  if (!trimmed) return CANCEL_APPOINTMENT_CONFIRM_TITLE;
  return `Cancel "${trimmed}"?`;
}

export type AppointmentCancelConfirmSubtitleInput = {
  start?: string | null;
  end?: string | null;
  patientLabel?: string | null;
};

/** Cancel visit confirm subtitle — visit range + optional patient. */
export function buildAppointmentCancelConfirmSubtitle(
  title: string,
  opts: AppointmentCancelConfirmSubtitleInput = {}
): ReactNode {
  const quoted = title.trim() || "this appointment";
  const { start, end, patientLabel } = opts;
  let rangeLabel = "";
  if (start && end) {
    const startDate = new Date(start);
    const endDate = new Date(end);
    if (!Number.isNaN(startDate.getTime()) && !Number.isNaN(endDate.getTime())) {
      rangeLabel = `${format(startDate, "dd.MM.yyyy")} · ${format(startDate, "HH:mm")} – ${format(endDate, "HH:mm")}`;
    }
  }
  const patient = patientLabel?.trim();

  return (
    <>
      <span className="font-medium text-gray-700">&ldquo;{quoted}&rdquo;</span>
      {rangeLabel ? (
        <>
          {" "}
          (<span className="font-medium text-gray-700">{rangeLabel}</span>)
        </>
      ) : null}{" "}
      will be marked cancelled. Stakeholders will be notified.
      {patient ? (
        <>
          {" "}
          Patient: <span className="font-medium text-gray-700">{patient}</span>.
        </>
      ) : null}
    </>
  );
}

export const DELETE_APPOINTMENT_TYPE_CONFIRM_TITLE = "Delete appointment type?";
export const DELETE_ORGANIZATION_CONFIRM_TITLE = "Delete organization?";
export const MARK_ALL_NOTIFICATIONS_READ_TITLE = "Mark all as read?";
export const DELETE_READ_NOTIFICATIONS_TITLE = "Delete all read notifications?";
export const DISCONNECT_GOOGLE_CALENDAR_CONFIRM_TITLE = "Disconnect Google Calendar?";
export const RESET_FORM_CONFIRM_TITLE = "Reset form?";
export const DELETE_WEEKLY_HOURS_WINDOW_CONFIRM_TITLE = "Delete weekly hours window?";
export const DELETE_UNAVAILABLE_DATE_CONFIRM_TITLE = "Delete unavailable date?";
export const DISABLE_VISIT_TYPE_CONFIRM_TITLE = "Disable visit type?";
/** @deprecated Use `DISABLE_VISIT_TYPE_CONFIRM_TITLE` */
export const DISABLE_GLOBAL_VISIT_TYPE_CONFIRM_TITLE = DISABLE_VISIT_TYPE_CONFIRM_TITLE;

/** CP appointment list/detail delete — title-driven copy. */
export function buildAppointmentDeleteConfirmSubtitle(
  title: string,
  context: "list" | "detail" = "list"
): ReactNode {
  const quoted = title.trim() || "this appointment";
  if (context === "detail") {
    return (
      <>
        This will permanently delete{" "}
        <span className="font-medium text-gray-700">&ldquo;{quoted}&rdquo;</span> and all related
        data. This cannot be undone.
      </>
    );
  }
  return (
    <>
      <span className="font-medium text-gray-700">{quoted}</span> will be permanently deleted along
      with its activities and assignees.
    </>
  );
}

/** CP organization row delete. */
export function buildOrganizationDeleteConfirmSubtitle(name: string): ReactNode {
  return (
    <>
      This will permanently delete{" "}
      <span className="font-medium text-gray-700">{name.trim() || "this organization"}</span> and all
      its members. This cannot be undone.
    </>
  );
}

/** Notifications toolbar — mark all unread as read. */
export function buildMarkAllNotificationsReadConfirmSubtitle(unreadCount: number): ReactNode {
  return (
    <>
      This will mark all{" "}
      <span className="font-medium text-gray-700">{unreadCount}</span> unread notifications as read.
    </>
  );
}

/** Notifications toolbar — bulk delete read rows. */
export function buildDeleteReadNotificationsConfirmSubtitle(readCount: number): ReactNode {
  return (
    <>
      This removes{" "}
      <span className="font-medium text-gray-700">{readCount}</span> read notification
      {readCount === 1 ? "" : "s"}. Unread items stay in your inbox.
    </>
  );
}

/** Google Calendar settings — OAuth disconnect. */
export function buildGoogleCalendarDisconnectConfirmSubtitle(): ReactNode {
  return (
    <>
      This will remove the OAuth token. Your existing appointments will not be deleted, but future
      syncs will stop working until you reconnect.
    </>
  );
}

/** Doctor detail form — discard unsaved edits. */
export function buildDiscardFormChangesConfirmSubtitle(): ReactNode {
  return <>This will discard all unsaved changes on this form.</>;
}

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
      <span className="font-medium text-gray-700">#{shortId}</span>
      {invoice.status ? (
        <>
          {" "}
          (<span className="font-medium text-gray-700">{invoice.status}</span>)
        </>
      ) : null}
      .
      <br />
      <span className="font-medium text-gray-700">{visitTitle}</span>
      {patient ? (
        <>
          {" "}
          for <span className="font-medium text-gray-700">{patient}</span>
        </>
      ) : null}{" "}
      — <span className="font-medium text-gray-700">{amount}</span>. This cannot be undone.
    </>
  );
}

type AppointmentTypeDeleteInput = {
  name: string;
  duration_minutes: number;
  price_cents?: number;
};

type CpAdminAppointmentTypeDeleteInput = AppointmentTypeDeleteInput & {
  user_id: string | null;
  owner_display_name?: string | null;
  owner_email?: string | null;
};

/** CP Appointment Types page — global template vs doctor-owned custom row delete. */
export function buildCpAdminAppointmentTypeDeleteConfirmSubtitle(
  type: CpAdminAppointmentTypeDeleteInput
): ReactNode {
  const fee =
    (type.price_cents ?? 0) > 0
      ? formatCentsToPriceInput(type.price_cents ?? 0)
      : null;
  const durationMeta = (
    <>
      <span className="font-medium text-gray-700">{type.duration_minutes} min</span>
      {fee ? (
        <>
          , <span className="font-medium text-gray-700">€{fee}</span>
        </>
      ) : null}
    </>
  );

  if (type.user_id == null) {
    return (
      <>
        This will permanently delete the organization-wide template{" "}
        <span className="font-medium text-gray-700">{type.name.trim()}</span> ({durationMeta}
        ). All doctors lose this visit type for new bookings. Existing appointments are not
        removed.
      </>
    );
  }

  const owner =
    type.owner_display_name?.trim() ||
    type.owner_email?.trim() ||
    "this doctor";

  return (
    <>
      This will permanently delete{" "}
      <span className="font-medium text-gray-700">{type.name.trim()}</span> ({durationMeta}) for{" "}
      <span className="font-medium text-gray-700">{owner}</span>. Patients can no longer book this
      custom visit type.
    </>
  );
}

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
      <span className="font-medium text-gray-700">{type.name.trim()}</span>
      {" "}
      (<span className="font-medium text-gray-700">{type.duration_minutes} min</span>
      {fee ? (
        <>
          , <span className="font-medium text-gray-700">€{fee}</span>
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
      <span className="font-medium text-gray-700">{label}</span> from your weekly hours.
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
      <span className="font-medium text-gray-700">{range}</span>
      {reason ? (
        <>
          {" "}
          (<span className="font-medium text-gray-700">{reason}</span>)
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
      <span className="font-medium text-gray-700">{type.name.trim()}</span>
      {" "}
      (<span className="font-medium text-gray-700">{type.duration_minutes} min</span>
      {tele ? (
        <span className="font-medium text-gray-700">{tele}</span>
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
      <span className="font-medium text-gray-700">{type.name.trim()}</span>
      {" "}
      (<span className="font-medium text-gray-700">{type.duration_minutes} min</span>
      {fee ? (
        <>
          , <span className="font-medium text-gray-700">€{fee}</span>
        </>
      ) : null}
      )? {bookingImpact} You can turn it back on anytime.
    </>
  );
}
