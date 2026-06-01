"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";
import { mapApiInvoiceToRow } from "@/lib/billing-invoice-map";
import type { InvoiceRow } from "@/lib/billing-types";

export type UseInvoiceQueryOptions = {
  /** SSR / parent seed — detail chrome stable; mutations invalidate this key for live footer. */
  initialData?: InvoiceRow | null;
};

/** Single invoice — mirrors GET /api/invoices/[id]; bust via invalidateInvoicesAndOverview({ invoiceId }). */
export function useInvoice(id: string | null, options?: UseInvoiceQueryOptions) {
  return useQuery({
    queryKey: queryKeys.invoices.detail(id ?? ""),
    queryFn: async () => {
      const res = await apiClient<{ invoice: InvoiceRow }>(`/api/invoices/${id}`);
      return mapApiInvoiceToRow(res.invoice);
    },
    enabled: !!id,
    initialData: options?.initialData ?? undefined,
    staleTime: 60_000,
  });
}
