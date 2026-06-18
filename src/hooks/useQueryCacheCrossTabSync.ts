"use client";

/**
 * Listens for cross-tab invalidation messages and applies scopes to this tab's QueryClient.
 * Invoice merge/remove payloads paint other tabs without invoices.all prefix refetch storms.
 */

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  applyCrossTabScopes,
  subscribeQueryCacheCrossTab,
} from "@/lib/query-cache-cross-tab";
import {
  mergeInvoiceIntoAllCaches,
  removeInvoiceFromScopedListCaches,
} from "@/lib/billing-invoice-map";
import { queryKeys } from "@/lib/query-keys";
import type { InvoiceRow } from "@/lib/billing-types";

export function useQueryCacheCrossTabSync(): void {
  const queryClient = useQueryClient();

  useEffect(() => {
    return subscribeQueryCacheCrossTab((message) => {
      if (message.invoiceMerge) {
        mergeInvoiceIntoAllCaches(queryClient, message.invoiceMerge);
      } else if (message.invoiceRemovedId) {
        const removedId = message.invoiceRemovedId;
        const fromList = queryClient
          .getQueryData<InvoiceRow[]>(queryKeys.invoices.all)
          ?.find((row) => row.id === removedId);
        const fromDetail = queryClient.getQueryData<InvoiceRow>(
          queryKeys.invoices.detail(removedId)
        );
        const row = fromList ?? fromDetail;
        if (row) {
          removeInvoiceFromScopedListCaches(queryClient, row);
        }
        queryClient.removeQueries({ queryKey: queryKeys.invoices.detail(removedId) });
      }
      if (message.scopes.length > 0) {
        void applyCrossTabScopes(queryClient, message.scopes);
      }
    });
  }, [queryClient]);
}
