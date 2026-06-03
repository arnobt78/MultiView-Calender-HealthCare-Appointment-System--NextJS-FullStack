"use client";

import { StaffInvoiceDialogShell } from "@/components/shared/billing/StaffInvoiceDialogShell";

/** Portal invoice detail — shared dialog for edit from detail header. */
export default function InvoicesLayout({ children }: { children: React.ReactNode }) {
  return <StaffInvoiceDialogShell>{children}</StaffInvoiceDialogShell>;
}
