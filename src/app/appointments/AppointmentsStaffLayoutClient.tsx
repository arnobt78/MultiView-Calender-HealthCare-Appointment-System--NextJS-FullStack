"use client";

import { StaffInvoiceDialogShell } from "@/components/shared/billing/StaffInvoiceDialogShell";
import type { Invoice } from "@/hooks/usePayments";

type Props = {
  children: React.ReactNode;
  initialInvoices?: Invoice[] | null;
};

/** Portal appointment routes — invoice dialog + warm invoices.all from server layout. */
export default function AppointmentsStaffLayoutClient({
  children,
  initialInvoices,
}: Props) {
  return (
    <StaffInvoiceDialogShell initialInvoices={initialInvoices}>
      <div className="mx-auto max-w-9xl">{children}</div>
    </StaffInvoiceDialogShell>
  );
}
