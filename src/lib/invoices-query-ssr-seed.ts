/**
 * Synchronous TanStack seed for queryKeys.invoices.all — parent useMemo before
 * child usePayments subscribes (avoids duplicate GET when SSR payload exists).
 */

import type { QueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import type { InvoiceRow } from "@/lib/billing-types";

/** Seed only when cache has no data yet (safe under React strict double-render). */
export function seedInvoicesListCacheFromSsr(
  queryClient: QueryClient,
  invoices: InvoiceRow[] | null | undefined
): void {
  if (invoices == null) return;
  const state = queryClient.getQueryState(queryKeys.invoices.all);
  if (state?.data !== undefined) return;
  queryClient.setQueryData(queryKeys.invoices.all, invoices);
}
