/**
 * Paid-invoice optional refund when cancelling a visit (REQ-0112).
 */

import { formatInvoiceMoney } from "@/lib/crud-notify-messages";
import { doctorCanMutateInvoice } from "@/lib/invoice-detail-action-capabilities";
import { isAdminRole } from "@/lib/rbac";
import type { InvoicePaymentRow, InvoiceRow } from "@/lib/billing-types";
import type { InvoiceVisitSummary } from "@/lib/billing-types";

export type AppointmentCancelRefundInvoicePick = Pick<
  InvoiceRow,
  "id" | "status" | "amount" | "currency" | "user_id" | "appointment_id"
> & {
  payments?: Pick<InvoicePaymentRow, "status" | "stripe_payment_id">[];
  visit_summary?: InvoiceVisitSummary | null;
};

/** Latest paid invoice row for a visit (warm invoices cache). */
export function resolvePaidInvoiceForAppointment(
  invoices: AppointmentCancelRefundInvoicePick[],
  appointmentId: string
): AppointmentCancelRefundInvoicePick | null {
  const row = invoices.find((inv) => inv.appointment_id === appointmentId);
  if (!row || row.status !== "paid") return null;
  return row;
}

/** Stripe refund path — manual mark-paid has no stripe_payment_id. */
export function paidInvoiceSupportsStripeRefund(
  invoice: AppointmentCancelRefundInvoicePick
): boolean {
  return (invoice.payments ?? []).some(
    (p) => p.status === "succeeded" && Boolean(p.stripe_payment_id?.trim())
  );
}

export type CanOfferRefundOnAppointmentCancelInput = {
  role: string | null | undefined;
  userId: string | null | undefined;
  paidInvoice: AppointmentCancelRefundInvoicePick | null;
};

/** Show refund checkbox on cancel confirm — admin or linked mutate doctor + Stripe payment. */
export function canOfferRefundOnAppointmentCancel(
  input: CanOfferRefundOnAppointmentCancelInput
): boolean {
  const { role, userId, paidInvoice } = input;
  if (!paidInvoice || !paidInvoiceSupportsStripeRefund(paidInvoice)) return false;
  if (isAdminRole(role)) return true;
  return doctorCanMutateInvoice(paidInvoice, userId);
}

/** Default-on when user may offer refund (product policy REQ-0112). */
export function defaultRefundCheckedOnCancel(
  input: CanOfferRefundOnAppointmentCancelInput
): boolean {
  return canOfferRefundOnAppointmentCancel(input);
}

export function formatRefundAmountLabel(
  invoice: Pick<InvoiceRow, "amount" | "currency">
): string {
  return formatInvoiceMoney({
    amount: invoice.amount,
    currency: invoice.currency,
    unit: "cents",
  });
}
