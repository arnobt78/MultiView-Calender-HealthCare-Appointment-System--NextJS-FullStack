/**
 * Client invoice list fetch — single queryFn for queryKeys.invoices.all (avoids /api/payments vs /api/invoices drift).
 */

import { apiClient } from "@/lib/api-client";
import type { InvoiceRow } from "@/lib/billing-types";

/** Matches usePayments + PatientPortal SSR seed stale window. */
export const INVOICES_LIST_STALE_MS = 30_000;

export async function fetchInvoicesListClient(): Promise<InvoiceRow[]> {
  const data = await apiClient<{ invoices: InvoiceRow[] }>("/api/invoices");
  return data.invoices ?? [];
}
