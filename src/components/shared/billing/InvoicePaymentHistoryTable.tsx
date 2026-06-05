"use client";

import { useMemo } from "react";
import { ClinicalDataTable } from "@/components/shared/ClinicalDataTable";
import { buildInvoicePaymentHistoryColumns } from "@/components/shared/billing/invoice-payment-history-columns";
import type { InvoicePaymentRow } from "@/lib/billing-types";
import { invoiceDetailTableFrameClass } from "@/lib/invoice-detail-ui-classes";

type Props = {
  payments: InvoicePaymentRow[];
  currency: string;
};

/** Hide duplicate Stripe webhook rows (legacy data before unique index). */
export function dedupePaymentsForDisplay(payments: InvoicePaymentRow[]): InvoicePaymentRow[] {
  const seenStripe = new Set<string>();
  const out: InvoicePaymentRow[] = [];
  for (const p of payments) {
    const ref = p.stripe_payment_id?.trim();
    if (ref) {
      if (seenStripe.has(ref)) continue;
      seenStripe.add(ref);
    }
    out.push(p);
  }
  return out;
}

/** Invoice detail payment history — ClinicalDataTable parity with patient-management tables. */
export function InvoicePaymentHistoryTable({ payments, currency }: Props) {
  const rows = useMemo(() => dedupePaymentsForDisplay(payments), [payments]);
  const columns = useMemo(() => buildInvoicePaymentHistoryColumns(currency), [currency]);

  return (
    <ClinicalDataTable
      data={rows}
      columns={columns}
      pagination={false}
      emptyMessage="No payments recorded yet."
      tableClassName="min-w-[640px] w-full"
      tableFrameClassName={invoiceDetailTableFrameClass}
    />
  );
}
