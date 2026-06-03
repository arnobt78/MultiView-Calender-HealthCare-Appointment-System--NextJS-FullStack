"use client";

import { StaffInvoiceDialogShell } from "@/components/shared/billing/StaffInvoiceDialogShell";

/** Portal appointment detail — shared invoice dialog for preset create from header. */
export default function AppointmentsDetailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <StaffInvoiceDialogShell>
      <div className="mx-auto max-w-9xl">{children}</div>
    </StaffInvoiceDialogShell>
  );
}
