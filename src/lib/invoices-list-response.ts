/**
 * Server-side invoice list payload — shared by GET /api/invoices, GET /api/payments, SSR prefetch.
 */

import { fetchInvoicesForViewer } from "@/lib/invoices-scope";
import { serializeInvoice } from "@/lib/serializers";
import {
  attachInvoiceIssuerLabels,
  attachVisitSummariesToInvoices,
} from "@/lib/invoice-visit-summary";
import type { InvoiceRow } from "@/lib/billing-types";

export async function loadInvoicesListForViewer(opts: {
  userId: string;
  role: string | null;
  email?: string | null;
  organizationId?: string | null;
}): Promise<InvoiceRow[]> {
  const rows = await fetchInvoicesForViewer({
    userId: opts.userId,
    role: opts.role,
    email: opts.email,
    organizationId: opts.organizationId ?? undefined,
  });

  const withVisits = await attachVisitSummariesToInvoices(
    rows.map((row) => ({
      ...serializeInvoice(row),
      payments: row.payments,
    }))
  );
  const labeled = await attachInvoiceIssuerLabels(withVisits);
  return labeled.map((row) => ({
    ...row,
    appointment_id: row.appointment_id ?? undefined,
    description: row.description ?? undefined,
    due_date: row.due_date ?? undefined,
    paid_at: row.paid_at ?? undefined,
    payments: row.payments.map((p) => ({
      ...p,
      created_at:
        typeof p.created_at === "string"
          ? p.created_at
          : (p.created_at?.toISOString?.() ?? ""),
      stripe_payment_id: p.stripe_payment_id ?? undefined,
    })),
  })) satisfies InvoiceRow[];
}
