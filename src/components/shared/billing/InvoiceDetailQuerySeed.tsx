"use client";

import { useLayoutEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import type { Invoice } from "@/hooks/usePayments";

type Props = {
  invoice: Invoice;
};

/** Seeds queryKeys.invoices.detail before InvoiceDetailClient paints (SSR + hard refresh). */
export function InvoiceDetailQuerySeed({ invoice }: Props) {
  const queryClient = useQueryClient();
  useLayoutEffect(() => {
    queryClient.setQueryData(queryKeys.invoices.detail(invoice.id), invoice);
  }, [queryClient, invoice]);
  return null;
}
