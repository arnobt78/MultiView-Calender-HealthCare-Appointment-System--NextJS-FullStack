"use client";

import { StaffInvoiceDialogShell } from "@/components/shared/billing/StaffInvoiceDialogShell";
import type { Invoice } from "@/hooks/usePayments";

type Props = {
  children: React.ReactNode;
  initialInvoices?: Invoice[] | null;
};

/** Portal invoice routes — shared dialog + SSR invoice list for detail actions. */
export default function InvoicesStaffLayoutClient({
  children,
  initialInvoices,
}: Props) {
  return (
    <StaffInvoiceDialogShell initialInvoices={initialInvoices}>
      {children}
    </StaffInvoiceDialogShell>
  );
}
