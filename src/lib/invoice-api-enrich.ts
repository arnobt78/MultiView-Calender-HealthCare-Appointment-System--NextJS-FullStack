/**
 * Shared invoice API enrichment — serialize + visit summary + issuer labels.
 * Used by GET/PATCH detail, SSR loaders, and prefetch.
 */

import { serializeInvoice } from "@/lib/serializers";
import {
  attachInvoiceIssuerLabels,
  attachVisitSummariesToInvoices,
  parseStoredVisitSnapshot,
} from "@/lib/invoice-visit-summary";
import type { InvoiceRow } from "@/lib/billing-types";

type InvoicePrismaRow = Parameters<typeof serializeInvoice>[0];

/** Prisma row → enriched API invoice (single row). */
export async function enrichInvoiceForApi(row: InvoicePrismaRow): Promise<InvoiceRow> {
  const serialized = serializeInvoice(row);
  const [withVisit] = await attachVisitSummariesToInvoices([serialized]);
  const [enriched] = await attachInvoiceIssuerLabels([withVisit]);
  const invoice = enriched ?? withVisit;

  return {
    ...invoice,
    appointment_id: invoice.appointment_id ?? undefined,
    organization_id:
      "organization_id" in row && row.organization_id != null
        ? (row.organization_id as string)
        : undefined,
    description: invoice.description ?? undefined,
    due_date: invoice.due_date ?? undefined,
    paid_at: invoice.paid_at ?? undefined,
    cancelled_at: invoice.cancelled_at ?? undefined,
    visit_detached_at: invoice.visit_detached_at ?? undefined,
    visit_detached_by_id: invoice.visit_detached_by_id ?? undefined,
    visit_detached_by_display: invoice.visit_detached_by_display ?? undefined,
    visit_detached_by_email: invoice.visit_detached_by_email ?? undefined,
    visit_detached_by_image: invoice.visit_detached_by_image ?? undefined,
    visit_detached_by_role: invoice.visit_detached_by_role ?? undefined,
    deleted_at: invoice.deleted_at ?? undefined,
    deleted_by_id: invoice.deleted_by_id ?? undefined,
    deleted_by_display: invoice.deleted_by_display ?? undefined,
    deleted_by_email: invoice.deleted_by_email ?? undefined,
    deleted_by_image: invoice.deleted_by_image ?? undefined,
    deleted_by_role: invoice.deleted_by_role ?? undefined,
    visit_snapshot: parseStoredVisitSnapshot(invoice.visit_snapshot) ?? undefined,
    updated_at: invoice.updated_at ?? undefined,
    payments: invoice.payments.map((p) => ({
      id: p.id,
      amount: p.amount,
      status: p.status,
      created_at: p.created_at,
      refunded_at: p.refunded_at ?? undefined,
      stripe_payment_id: p.stripe_payment_id ?? undefined,
    })),
  };
}
