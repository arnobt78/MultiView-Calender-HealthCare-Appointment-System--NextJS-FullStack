"use client";

import { useMemo, type ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { seedInvoicesListCacheFromSsr } from "@/lib/invoices-query-ssr-seed";
import type { Invoice } from "@/hooks/usePayments";

type Props = {
  /** SSR list for queryKeys.invoices.all — calendar badges + detail billing actions. */
  initialInvoices?: Invoice[] | null;
  children: ReactNode;
};

/**
 * Sync-seeds invoice list cache before children call usePayments / useAppointmentInvoiceDisplayMap.
 */
export function InvoicesListSsrSeed({ initialInvoices, children }: Props) {
  const queryClient = useQueryClient();

  useMemo(() => {
    seedInvoicesListCacheFromSsr(queryClient, initialInvoices ?? undefined);
    return null;
  }, [queryClient, initialInvoices]);

  return <>{children}</>;
}
