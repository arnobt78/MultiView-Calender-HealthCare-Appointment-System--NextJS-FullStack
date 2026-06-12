/**
 * Client invoice list fetch — single queryFn for scoped invoice list keys.
 */

import { apiClient } from "@/lib/api-client";
import type { InvoiceRow } from "@/lib/billing-types";

/** Matches usePayments + PatientPortal SSR seed stale window. */
export const INVOICES_LIST_STALE_MS = 30_000;

export type InvoicesListClientOpts = {
  organizationId?: string;
  doctorId?: string;
};

function buildInvoicesListQueryString(opts?: InvoicesListClientOpts): string {
  const orgId = opts?.organizationId?.trim();
  const doctorId = opts?.doctorId?.trim();
  const params = new URLSearchParams();
  if (orgId) params.set("organizationId", orgId);
  if (doctorId) params.set("doctorId", doctorId);
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

export async function fetchInvoicesListClient(
  opts?: InvoicesListClientOpts
): Promise<InvoiceRow[]> {
  const data = await apiClient<{ invoices: InvoiceRow[] }>(
    `/api/invoices${buildInvoicesListQueryString(opts)}`
  );
  return data.invoices ?? [];
}

export async function fetchInvoiceBillingTotalsClient(opts?: {
  organizationId?: string;
  doctorId?: string;
}): Promise<import("@/lib/invoice-billing-totals").InvoiceBillingTotalsPayload> {
  const orgId = opts?.organizationId?.trim();
  const doctorId = opts?.doctorId?.trim();
  const params = new URLSearchParams();
  if (orgId) params.set("organizationId", orgId);
  if (doctorId) params.set("doctorId", doctorId);
  const qs = params.toString();
  return apiClient(`/api/invoices/billing-totals${qs ? `?${qs}` : ""}`);
}
