/**
 * One active create invoice per visit — picker eligibility + UI display status (incl. refunded).
 */

import { prisma } from "@/lib/prisma";
import type { InvoicePaymentRow, InvoiceStatus } from "@/lib/billing-types";
import { isVisitBillingFrozen } from "@/lib/visit-billing-action-gates";

/** Blocks a create invoice for the same appointment_id. */
export const BLOCKING_INVOICE_STATUSES = [
  "draft",
  "sent",
  "overdue",
  "paid",
] as const satisfies readonly InvoiceStatus[];

export type BlockingInvoiceStatus = (typeof BLOCKING_INVOICE_STATUSES)[number];

/** After cancel/refund, staff may create a create invoice for the visit. */
export const REBILLABLE_INVOICE_STATUSES = ["cancelled"] as const satisfies readonly InvoiceStatus[];

/** UI-only label when invoice is cancelled and payment was refunded. */
export type InvoiceDisplayStatus = InvoiceStatus | "refunded";

export type InvoiceForDisplay = {
  status: string;
  payments?: Pick<InvoicePaymentRow, "status">[];
};

export type LatestInvoiceForAppointment = {
  id: string;
  status: string;
  amount: number;
  currency: string;
  payments: Pick<InvoicePaymentRow, "status">[];
};

export type AppointmentBillingSummary = {
  eligible: boolean;
  blockReason: string | null;
  invoiceId: string | null;
  invoiceStatus: string | null;
  displayStatus: InvoiceDisplayStatus | null;
  amountCents: number | null;
  currency: string | null;
  hasRefundedPayment: boolean;
};

export function isBlockingInvoiceStatus(status: string): status is BlockingInvoiceStatus {
  return (BLOCKING_INVOICE_STATUSES as readonly string[]).includes(status);
}

/** Refunded Stripe flow sets invoice to cancelled + payment refunded — show Refunded in UI. */
export function resolveInvoiceDisplayStatus(invoice: InvoiceForDisplay): InvoiceDisplayStatus {
  const payments = invoice.payments ?? [];
  const hasRefunded = payments.some((p) => p.status === "refunded");
  if (hasRefunded && invoice.status === "cancelled") return "refunded";
  if (invoice.status === "cancelled") return "cancelled";
  if (isBlockingInvoiceStatus(invoice.status)) return invoice.status;
  if ((REBILLABLE_INVOICE_STATUSES as readonly string[]).includes(invoice.status)) {
    return invoice.status as InvoiceStatus;
  }
  return invoice.status as InvoiceDisplayStatus;
}

export function resolveAppointmentBillingSummary(
  latest: LatestInvoiceForAppointment | null
): AppointmentBillingSummary {
  if (!latest) {
    return {
      eligible: true,
      blockReason: null,
      invoiceId: null,
      invoiceStatus: null,
      displayStatus: null,
      amountCents: null,
      currency: null,
      hasRefundedPayment: false,
    };
  }

  const displayStatus = resolveInvoiceDisplayStatus(latest);
  const hasRefundedPayment = (latest.payments ?? []).some((p) => p.status === "refunded");
  const blocking = isBlockingInvoiceStatus(latest.status);

  return {
    eligible: !blocking,
    blockReason: blocking
      ? `Visit already has a ${latest.status} invoice`
      : null,
    invoiceId: latest.id,
    invoiceStatus: latest.status,
    displayStatus,
    amountCents: latest.amount,
    currency: latest.currency,
    hasRefundedPayment,
  };
}

type InvoiceRowWithAppointment = LatestInvoiceForAppointment & {
  appointment_id: string | null;
  created_at: Date;
  deleted_at?: Date | string | null;
};

/** Latest invoice row per appointment_id (by created_at desc input order). */
export function mapLatestInvoicesByAppointmentId(
  rows: InvoiceRowWithAppointment[]
): Map<string, LatestInvoiceForAppointment> {
  const map = new Map<string, LatestInvoiceForAppointment>();
  for (const row of rows) {
    const apptId = row.appointment_id;
    if (!apptId) continue;
    if (row.deleted_at != null && String(row.deleted_at).trim() !== "") continue;
    const existing = map.get(apptId);
    if (!existing) {
      map.set(apptId, {
        id: row.id,
        status: row.status,
        amount: row.amount,
        currency: row.currency,
        payments: row.payments ?? [],
      });
    }
  }
  return map;
}

export async function findBlockingInvoiceForAppointment(
  appointmentId: string
): Promise<LatestInvoiceForAppointment | null> {
  const row = await prisma.invoice.findFirst({
    where: {
      appointment_id: appointmentId,
      deleted_at: null,
      status: { in: [...BLOCKING_INVOICE_STATUSES] },
    },
    orderBy: { created_at: "desc" },
    select: {
      id: true,
      status: true,
      amount: true,
      currency: true,
      payments: { select: { status: true } },
    },
  });
  if (!row) return null;
  return {
    id: row.id,
    status: row.status,
    amount: row.amount,
    currency: row.currency,
    payments: row.payments,
  };
}

export type AssertAppointmentEligibleResult =
  | { ok: true }
  | { ok: false; status: 409; message: string; invoiceId: string };

/** POST /api/invoices — one active bill per encounter. */
/** Batch latest invoice display status per appointment (calendar cards + snapshot). */
export async function mapLatestInvoiceDisplayByAppointmentIds(
  appointmentIds: string[]
): Promise<Map<string, InvoiceDisplayStatus>> {
  const map = new Map<string, InvoiceDisplayStatus>();
  if (appointmentIds.length === 0) return map;

  const rows = await prisma.invoice.findMany({
    where: { appointment_id: { in: appointmentIds }, deleted_at: null },
    orderBy: { created_at: "desc" },
    select: {
      appointment_id: true,
      status: true,
      created_at: true,
      payments: { select: { status: true } },
    },
  });

  const latestByAppt = new Map<
    string,
    { status: string; payments: Pick<InvoicePaymentRow, "status">[] }
  >();

  for (const row of rows) {
    const apptId = row.appointment_id;
    if (!apptId || latestByAppt.has(apptId)) continue;
    latestByAppt.set(apptId, {
      status: row.status,
      payments: row.payments,
    });
  }

  for (const [apptId, latest] of latestByAppt) {
    map.set(apptId, resolveInvoiceDisplayStatus(latest));
  }
  return map;
}

export async function assertAppointmentEligibleForNewInvoice(
  appointmentId: string
): Promise<AssertAppointmentEligibleResult> {
  const appointment = await prisma.appointment.findUnique({
    where: { id: appointmentId },
    select: { status: true },
  });
  if (!appointment) {
    return {
      ok: false,
      status: 409,
      message: "Appointment not found.",
      invoiceId: "",
    };
  }
  if (isVisitBillingFrozen(appointment.status)) {
    return {
      ok: false,
      status: 409,
      message: "Cannot create an invoice for a cancelled visit.",
      invoiceId: "",
    };
  }

  const blocking = await findBlockingInvoiceForAppointment(appointmentId);
  if (!blocking) return { ok: true };
  return {
    ok: false,
    status: 409,
    message: `This visit already has an active invoice (${blocking.status}). Open invoice ${blocking.id.slice(0, 8)}… or cancel/refund before creating another.`,
    invoiceId: blocking.id,
  };
}
