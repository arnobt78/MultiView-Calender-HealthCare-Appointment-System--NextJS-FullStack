/**
 * Shared SSR payload for invoice detail pages (CP + portal `/invoices/[id]`).
 */

import { prisma } from "@/lib/prisma";
import { serializeInvoice } from "@/lib/serializers";
import {
  resolveInvoiceAccess,
  type InvoiceAccessSession,
} from "@/lib/invoice-access";
import type { InvoiceAccessLevel } from "@/lib/billing-types";
import type { Invoice } from "@/hooks/usePayments";
import { loadInvoiceVisitSummary } from "@/lib/invoice-visit-summary";

export type InvoiceDetailUiAccess = "admin" | "view" | "mutate" | "pay";

export function toInvoiceUiAccess(level: InvoiceAccessLevel): InvoiceDetailUiAccess {
  if (level === "admin") return "admin";
  if (level === "mutate") return "mutate";
  if (level === "pay") return "pay";
  return "view";
}

/** Prisma row + payments → client Invoice shape for hooks/seed. */
export function toClientInvoice(
  raw: Awaited<ReturnType<typeof loadInvoiceDetailRow>>
): Invoice | null {
  if (!raw) return null;
  const invoice = serializeInvoice(raw);

  return {
    ...invoice,
    appointment_id: invoice.appointment_id ?? undefined,
    organization_id: raw.organization_id ?? undefined,
    description: invoice.description ?? undefined,
    due_date: invoice.due_date ?? undefined,
    paid_at: invoice.paid_at ?? undefined,
    payments: raw.payments.map((p) => ({
      id: p.id,
      amount: p.amount,
      status: p.status,
      created_at: p.created_at.toISOString(),
      stripe_payment_id: p.stripe_payment_id ?? undefined,
    })),
  };
}

export async function loadInvoiceDetailRow(invoiceId: string) {
  return prisma.invoice.findUnique({
    where: { id: invoiceId },
    include: { payments: { orderBy: { created_at: "desc" } } },
  });
}

export type InvoiceDetailSsrPayload = {
  clientInvoice: Invoice;
  accessLevel: InvoiceAccessLevel;
  uiAccess: InvoiceDetailUiAccess;
};

/** Access check + row load for invoice detail SSR routes. */
export async function loadInvoiceDetailForPage(
  invoiceId: string,
  session: InvoiceAccessSession
): Promise<InvoiceDetailSsrPayload | null> {
  const accessLevel = await resolveInvoiceAccess(session, invoiceId);
  if (accessLevel === "none") return null;
  const raw = await loadInvoiceDetailRow(invoiceId);
  const clientInvoice = toClientInvoice(raw);
  if (!clientInvoice) return null;

  if (raw?.appointment_id) {
    clientInvoice.visit_summary =
      (await loadInvoiceVisitSummary(raw.appointment_id)) ?? undefined;
  }

  return {
    clientInvoice,
    accessLevel,
    uiAccess: toInvoiceUiAccess(accessLevel),
  };
}
