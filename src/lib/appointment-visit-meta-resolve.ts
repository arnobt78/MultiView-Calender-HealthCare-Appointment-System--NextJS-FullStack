/**
 * Visit-meta chip inputs — shared by telehealth queue rows and appointment detail.
 * Keeps fee/billing resolution in one lib (no duplicate logic in components).
 */

import type { FullAppointment } from "@/hooks/useAppointments";
import { resolveDisplayedVisitFeeCents } from "@/lib/appointment-visit-fee-display";
import {
  resolveAppointmentListBillingBadges,
  resolveLatestInvoicePayment,
} from "@/lib/appointment-invoice-lookup";
import { resolveInvoiceDisplayStatus } from "@/lib/billing-appointment-eligibility";
import type { InvoiceDisplayStatus } from "@/lib/billing-appointment-eligibility";
import type { InvoicePaymentRow, InvoiceRow } from "@/lib/billing-types";
import {
  resolveTelehealthDurationMinutes,
  resolveTelehealthVisitTypeLabel,
} from "@/lib/telehealth-queue-display";

export type AppointmentVisitMetaFields = {
  appointmentTypeName: string | null;
  durationMinutes: number | null;
  visitFeeCents: number;
  showVisitFeeEstimateHint: boolean;
};

export type AppointmentVisitMetaBilling = {
  invoiceDisplayStatus: InvoiceDisplayStatus | null;
  latestPayment: InvoicePaymentRow | null;
  showInvoice: boolean;
  showPayment: boolean;
};

/** Fee + type + duration from a calendar `FullAppointment` row. */
export function resolveAppointmentVisitMetaFromFullAppointment(
  appointment: FullAppointment
): AppointmentVisitMetaFields {
  const durationMinutes = resolveTelehealthDurationMinutes(appointment);
  const visitFeeCents = resolveDisplayedVisitFeeCents({
    typePriceCents: appointment.appointment_type_price_cents,
    doctorConsultationFeeCents: appointment.doctor_consultation_fee_cents,
  });

  return {
    appointmentTypeName: appointment.appointment_type_name?.trim() || null,
    durationMinutes: durationMinutes > 0 ? durationMinutes : null,
    visitFeeCents,
    showVisitFeeEstimateHint: (appointment.appointment_type_price_cents ?? 0) <= 0,
  };
}

/** Telehealth queue fallback when type name absent on row. */
export function resolveAppointmentVisitMetaFromFullAppointmentTelehealth(
  appointment: FullAppointment
): AppointmentVisitMetaFields {
  const base = resolveAppointmentVisitMetaFromFullAppointment(appointment);
  if (base.appointmentTypeName) return base;
  const fallback = resolveTelehealthVisitTypeLabel(appointment);
  return {
    ...base,
    appointmentTypeName: fallback?.trim() || null,
  };
}

/** Invoice + payment badge visibility — mirrors CP appointment list billing column. */
export function resolveAppointmentVisitMetaBilling(
  invoice?: InvoiceRow | null
): AppointmentVisitMetaBilling {
  const invoiceDisplayStatus = invoice
    ? resolveInvoiceDisplayStatus(invoice)
    : null;
  const latestPayment = resolveLatestInvoicePayment(invoice?.payments);
  const { showInvoice, showPayment } = resolveAppointmentListBillingBadges({
    invoiceDisplayStatus,
    latestPaymentStatus: latestPayment?.status ?? null,
  });

  return {
    invoiceDisplayStatus,
    latestPayment,
    showInvoice,
    showPayment,
  };
}
