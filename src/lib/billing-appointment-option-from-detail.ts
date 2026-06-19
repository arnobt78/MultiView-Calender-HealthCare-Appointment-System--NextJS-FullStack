/**
 * Map appointment detail view-model → invoice create picker row.
 * Seeds `queryKeys.billing.appointmentOptions(id)` so Create Invoice dialog skips fetch skeleton.
 */
import type { AppointmentDetailViewModel } from "@/lib/appointment-detail-view-model";
import { formatAppointmentDetailWhenRange } from "@/lib/appointment-detail-view-model";
import { resolveAppointmentDisplayLocation } from "@/lib/appointment-visit-location";
import {
  mapLatestInvoicesByAppointmentId,
  resolveAppointmentBillingSummary,
} from "@/lib/billing-appointment-eligibility";
import type { InvoiceAppointmentOptionRow } from "@/lib/billing-types";
import type { Invoice } from "@/hooks/usePayments";
import { clinicianDisplayNameOnly } from "@/lib/appointment-detail-view-model";

import type { LatestInvoiceForAppointment } from "@/lib/billing-appointment-eligibility";

function mapLinkedInvoicesToLatest(
  linkedInvoices: readonly Invoice[]
): LatestInvoiceForAppointment | null {
  if (linkedInvoices.length === 0) return null;
  const rows = linkedInvoices.map((inv) => ({
    id: inv.id,
    status: inv.status,
    amount: inv.amount,
    currency: inv.currency,
    payments: inv.payments ?? [],
    appointment_id: inv.appointment_id ?? null,
    created_at: new Date(inv.created_at),
  }));
  const latest = mapLatestInvoicesByAppointmentId(rows).values().next().value ?? null;
  return latest ?? null;
}

/** Build create invoice picker row from SSR detail cache — parity with billing-appointment-options-load. */
export function mapAppointmentDetailToBillingOption(
  detail: AppointmentDetailViewModel,
  linkedInvoices: readonly Invoice[] = []
): InvoiceAppointmentOptionRow {
  const appt = detail.appointment;
  const patient = detail.patient;
  const category = detail.category;
  const calendarOwner = detail.calendarOwner;
  const treatingPhysician = detail.treatingPhysician;
  const billing = resolveAppointmentBillingSummary(mapLinkedInvoicesToLatest(linkedInvoices));

  const patientLabel = patient
    ? `${patient.firstname} ${patient.lastname}`.trim() || patient.email || "Patient"
    : "Patient";

  const whenLabel = formatAppointmentDetailWhenRange(appt) ?? undefined;
  const locationLabel = resolveAppointmentDisplayLocation({
    location: appt.location,
    is_telehealth: appt.is_telehealth,
  });

  const typePriceCents = appt.appointment_type_price_cents ?? null;
  const doctorFeeCents =
    treatingPhysician?.consultation_fee ??
    calendarOwner?.consultation_fee ??
    appt.doctor_consultation_fee_cents ??
    null;

  return {
    id: appt.id,
    title: appt.title,
    start: appt.start,
    end: appt.end,
    owner_id: appt.user_id,
    patient_label: patientLabel,
    eligible: billing.eligible,
    block_reason: billing.blockReason,
    invoice_id: billing.invoiceId,
    invoice_status: billing.invoiceStatus,
    display_status: billing.displayStatus,
    amount_cents: billing.amountCents,
    currency: billing.currency,
    suggested_amount_cents: billing.eligible ? detail.visitFeeCents : null,
    appointment_type_price_cents: typePriceCents,
    doctor_consultation_fee_cents: doctorFeeCents,
    patient_id: patient?.id ?? null,
    patient_email: patient?.email ?? null,
    patient_birth_date: patient?.birth_date ?? null,
    patient_care_level: patient?.care_level ?? null,
    patient_clinical_profile: patient?.clinical_profile ?? null,
    when_label: whenLabel,
    location_label: locationLabel,
    is_telehealth: appt.is_telehealth,
    appointment_type_name: appt.appointment_type_name ?? null,
    category_id: category?.id ?? null,
    category_label: category?.label ?? null,
    category_color: category?.color ?? null,
    category_icon: category?.icon ?? null,
    treating_physician_id: treatingPhysician?.id ?? appt.treating_physician_id ?? null,
    treating_physician_label: clinicianDisplayNameOnly(treatingPhysician),
    treating_physician_email: treatingPhysician?.email ?? null,
    treating_physician_specialty: treatingPhysician?.specialty ?? null,
    treating_physician_image: treatingPhysician?.image ?? null,
    treating_physician_role: treatingPhysician?.role ?? null,
    calendar_owner_id: calendarOwner?.id ?? appt.user_id ?? null,
    calendar_owner_label: clinicianDisplayNameOnly(calendarOwner),
    calendar_owner_email: calendarOwner?.email ?? null,
    calendar_owner_specialty: calendarOwner?.specialty ?? null,
    calendar_owner_image: calendarOwner?.image ?? null,
    calendar_owner_role: calendarOwner?.role ?? null,
    duration_minutes: detail.durationMinutes,
    appointment_type_duration_minutes: appt.appointment_type_duration_minutes ?? null,
  };
}
