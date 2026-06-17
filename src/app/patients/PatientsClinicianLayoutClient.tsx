"use client";

import { ClinicianInvoiceDialogShell } from "@/components/shared/billing/ClinicianInvoiceDialogShell";
import type { Invoice } from "@/hooks/usePayments";

type Props = {
  children: React.ReactNode;
  initialInvoices?: Invoice[] | null;
};

/** Portal patient routes — invoice dialog + warm invoices.all from server layout. */
export default function PatientsClinicianLayoutClient({
  children,
  initialInvoices,
}: Props) {
  return (
    <ClinicianInvoiceDialogShell initialInvoices={initialInvoices}>
      <div className="mx-auto max-w-9xl">{children}</div>
    </ClinicianInvoiceDialogShell>
  );
}
