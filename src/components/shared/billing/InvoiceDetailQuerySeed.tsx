"use client";

import { useLayoutEffect, useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { mergeInvoiceIntoScopedListCaches } from "@/lib/billing-invoice-map";
import { seedInvoicesListCacheFromSsr } from "@/lib/invoices-query-ssr-seed";
import type { Invoice } from "@/hooks/usePayments";

type Props = {
  invoice: Invoice;
  /** SSR invoice list — avoids GET /api/invoices on detail mount (usePayments in footer). */
  initialInvoicesList?: Invoice[] | null;
};

/** Seeds invoices.detail + invoices.all before InvoiceDetailClient paints. */
export function InvoiceDetailQuerySeed({ invoice, initialInvoicesList }: Props) {
  const queryClient = useQueryClient();

  useMemo(() => {
    seedInvoicesListCacheFromSsr(queryClient, initialInvoicesList ?? undefined);
    return null;
  }, [queryClient, initialInvoicesList]);

  useLayoutEffect(() => {
    queryClient.setQueryData(queryKeys.invoices.detail(invoice.id), invoice);
    mergeInvoiceIntoScopedListCaches(queryClient, invoice);
  }, [queryClient, invoice]);

  return null;
}
