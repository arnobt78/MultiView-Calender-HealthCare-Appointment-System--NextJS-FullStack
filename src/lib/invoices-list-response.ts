/**
 * Server-side invoice list payload — shared by GET /api/invoices, GET /api/payments, SSR prefetch.
 */

import { fetchInvoicesForViewer } from "@/lib/invoices-scope";
import { serializeInvoice } from "@/lib/serializers";
import {
  attachInvoiceIssuerLabels,
  attachVisitSummariesToInvoices,
  parseStoredVisitSnapshot,
} from "@/lib/invoice-visit-summary";
import type { InvoiceRow } from "@/lib/billing-types";

export async function loadInvoicesListForViewer(opts: {
  userId: string;
  role: string | null;
  email?: string | null;
  organizationId?: string | null;
  doctorId?: string | null;
}): Promise<InvoiceRow[]> {
  const rows = await fetchInvoicesForViewer({
    userId: opts.userId,
    role: opts.role,
    email: opts.email,
    organizationId: opts.organizationId ?? undefined,
    doctorId: opts.doctorId ?? undefined,
  });

  const withVisits = await attachVisitSummariesToInvoices(rows.map((row) => serializeInvoice(row)));
  const labeled = await attachInvoiceIssuerLabels(withVisits);
  return labeled.map((row) => ({
    ...row,
    appointment_id: row.appointment_id ?? undefined,
    description: row.description ?? undefined,
    due_date: row.due_date ?? undefined,
    paid_at: row.paid_at ?? undefined,
    cancelled_at: row.cancelled_at ?? undefined,
    visit_detached_at: row.visit_detached_at ?? undefined,
    visit_detached_by_id: row.visit_detached_by_id ?? undefined,
    visit_detached_by_display: row.visit_detached_by_display ?? undefined,
    visit_detached_by_email: row.visit_detached_by_email ?? undefined,
    visit_detached_by_image: row.visit_detached_by_image ?? undefined,
    visit_detached_by_role: row.visit_detached_by_role ?? undefined,
    deleted_at: row.deleted_at ?? undefined,
    deleted_by_id: row.deleted_by_id ?? undefined,
    deleted_by_display: row.deleted_by_display ?? undefined,
    deleted_by_email: row.deleted_by_email ?? undefined,
    deleted_by_image: row.deleted_by_image ?? undefined,
    deleted_by_role: row.deleted_by_role ?? undefined,
    visit_snapshot: parseStoredVisitSnapshot(row.visit_snapshot) ?? undefined,
    updated_at: row.updated_at ?? undefined,
    payments: row.payments.map((p) => ({
      id: p.id,
      amount: p.amount,
      status: p.status,
      created_at: p.created_at,
      refunded_at: p.refunded_at ?? undefined,
      stripe_payment_id: p.stripe_payment_id ?? undefined,
    })),
  })) satisfies InvoiceRow[];
}
