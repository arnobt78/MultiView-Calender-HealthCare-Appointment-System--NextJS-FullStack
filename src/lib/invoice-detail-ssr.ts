/**
 * Shared SSR payload for invoice detail pages (CP + portal `/invoices/[id]`).
 */

import { prisma } from "@/lib/prisma";
import {
  resolveInvoiceAccess,
  type InvoiceAccessSession,
} from "@/lib/invoice-access";
import type { InvoiceAccessLevel } from "@/lib/billing-types";
import type { Invoice } from "@/hooks/usePayments";
import { loadInvoiceVisitSummary } from "@/lib/invoice-visit-summary";
import { invoiceDetailInclude } from "@/lib/invoice-api-include";
import { enrichInvoiceForApi } from "@/lib/invoice-api-enrich";

export type InvoiceDetailUiAccess = "admin" | "view" | "mutate" | "pay";

export function toInvoiceUiAccess(level: InvoiceAccessLevel): InvoiceDetailUiAccess {
  if (level === "admin") return "admin";
  if (level === "mutate") return "mutate";
  if (level === "pay") return "pay";
  return "view";
}

/** Prisma row + payments → client Invoice shape for hooks/seed. */
export async function toClientInvoice(
  raw: Awaited<ReturnType<typeof loadInvoiceDetailRow>>
): Promise<Invoice | null> {
  if (!raw) return null;
  return enrichInvoiceForApi(raw);
}

export async function loadInvoiceDetailRow(invoiceId: string) {
  return prisma.invoice.findUnique({
    where: { id: invoiceId },
    include: invoiceDetailInclude,
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
  const clientInvoice = await toClientInvoice(raw);
  if (!clientInvoice) return null;

  if (raw?.appointment_id && !clientInvoice.visit_summary) {
    clientInvoice.visit_summary =
      (await loadInvoiceVisitSummary(raw.appointment_id)) ?? undefined;
  }

  return {
    clientInvoice,
    accessLevel,
    uiAccess: toInvoiceUiAccess(accessLevel),
  };
}
