/**
 * Client cache sync when visit transitions to done — auto-draft invoice badge + portal list (REQ-0115).
 */

import type { QueryClient } from "@tanstack/react-query";
import type { InvoiceRow } from "@/lib/billing-types";
import { mergeInvoiceIntoAllCaches } from "@/lib/billing-invoice-map";
import { publishInvoiceMergeCrossTab } from "@/lib/query-cache-cross-tab";
import {
  getPatientIdFromAppointmentCache,
  invalidateInvoicesAndOverview,
  syncInvoicesAfterWrite,
} from "@/lib/query-client";

export function isAppointmentDoneTransition(
  previousStatus: string | null | undefined,
  nextStatus: string | null | undefined
): boolean {
  return previousStatus !== "done" && nextStatus === "done";
}

type SyncOpts = {
  appointmentId: string;
  patientId?: string | null;
  previousStatus?: string | null;
  nextStatus?: string | null;
  autoDraftInvoice?: InvoiceRow | null;
};

/** Merge auto-draft row locally; background invalidation when done without inline invoice. */
export async function syncInvoicesAfterAppointmentDone(
  queryClient: QueryClient,
  opts: SyncOpts
): Promise<void> {
  const doneTransition = isAppointmentDoneTransition(opts.previousStatus, opts.nextStatus);
  const row = opts.autoDraftInvoice ?? null;
  const patientId =
    opts.patientId ?? getPatientIdFromAppointmentCache(queryClient, opts.appointmentId);

  if (row) {
    mergeInvoiceIntoAllCaches(queryClient, row);
    await syncInvoicesAfterWrite(queryClient, {
      invoiceId: row.id,
      patientId,
      organizationId: row.organization_id ?? undefined,
      scope: "billing",
      totalsChanged: true,
      status: row.status,
      cachesMerged: true,
    });
    publishInvoiceMergeCrossTab(row, { scope: "billing", patientId });
    return;
  }

  if (doneTransition) {
    await invalidateInvoicesAndOverview(queryClient, { patientId: patientId ?? undefined });
  }
}
