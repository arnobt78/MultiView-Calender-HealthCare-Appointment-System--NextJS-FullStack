/**
 * Enrich auto-draft invoice for appointment PATCH/PUT responses (REQ-0115).
 */

import { prisma } from "@/lib/prisma";
import type { InvoiceAccessSession } from "@/lib/invoice-access";
import { maybeCreateDraftInvoiceForCompletedVisit } from "@/lib/billing-auto-draft";
import { BLOCKING_INVOICE_STATUSES } from "@/lib/billing-appointment-eligibility";
import { invoiceDetailInclude } from "@/lib/invoice-api-include";
import { enrichInvoiceForApi } from "@/lib/invoice-api-enrich";
import type { InvoiceRow } from "@/lib/billing-types";

/** Run auto-draft on done transition; return enriched row for client cache merge. */
export async function resolveAutoDraftInvoiceOnDoneTransition(opts: {
  appointmentId: string;
  session: InvoiceAccessSession;
  previousStatus?: string | null;
  requestedStatus?: string | null;
  updatedStatus: string | null;
}): Promise<InvoiceRow | undefined> {
  const { appointmentId, session, previousStatus, requestedStatus, updatedStatus } = opts;
  if (requestedStatus !== "done" || previousStatus === "done" || updatedStatus !== "done") {
    return undefined;
  }

  const draftResult = await maybeCreateDraftInvoiceForCompletedVisit(appointmentId, session);

  let invoiceId = draftResult.created ? draftResult.invoiceId : undefined;
  if (!invoiceId) {
    const existing = await prisma.invoice.findFirst({
      where: {
        appointment_id: appointmentId,
        status: { in: [...BLOCKING_INVOICE_STATUSES] },
      },
      orderBy: { created_at: "desc" },
      select: { id: true },
    });
    invoiceId = existing?.id;
  }
  if (!invoiceId) return undefined;

  const row = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    include: invoiceDetailInclude,
  });
  if (!row) return undefined;

  return enrichInvoiceForApi(row);
}
