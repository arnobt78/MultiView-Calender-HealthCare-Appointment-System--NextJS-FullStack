"use client";

import { InvoiceFormDialogProvider } from "@/context/InvoiceFormDialogContext";
import { InvoicesListSsrSeed } from "@/components/shared/billing/InvoicesListSsrSeed";
import type { Invoice } from "@/hooks/usePayments";

type Props = {
  children: React.ReactNode;
  variant?: "admin" | "doctor";
  /** Layout SSR — warms invoices.all for dialog + calendar badges before usePayments mounts. */
  initialInvoices?: Invoice[] | null;
};

/** Mount once per staff layout — shared invoice create/edit dialog for calendar + lists. */
export function StaffInvoiceDialogShell({ children, variant, initialInvoices }: Props) {
  return (
    <InvoicesListSsrSeed initialInvoices={initialInvoices}>
      <InvoiceFormDialogProvider
        variant={variant}
        invoicesInitialData={initialInvoices ?? undefined}
      >
        {children}
      </InvoiceFormDialogProvider>
    </InvoicesListSsrSeed>
  );
}
