"use client";

import { Banknote, CreditCard, RotateCcw, XCircle } from "lucide-react";
import { PatientStatCard } from "@/components/control-panel/PatientStatCard";
import {
  computeInvoiceBillingTotals,
  type InvoiceBillingTotals,
} from "@/lib/invoice-billing-totals";
import { formatInvoiceMoney } from "@/lib/crud-notify-messages";
import type { InvoiceRow } from "@/lib/billing-types";

type Props = {
  invoices: ReadonlyArray<Pick<InvoiceRow, "amount" | "status">>;
  totals?: InvoiceBillingTotals;
  valueSkeleton: boolean;
};

/** Four glass KPI tiles — shared by Invoice Management + org billing panel. */
export function InvoiceBillingStatsRow({ invoices, totals: prefetchedTotals, valueSkeleton }: Props) {
  // Prefer server aggregate totals for org panels; fallback keeps Invoice Management behavior unchanged.
  const totals = prefetchedTotals ?? computeInvoiceBillingTotals(invoices);

  const paidDisplay = formatInvoiceMoney({
    amount: totals.paid.cents,
    currency: "eur",
    unit: "cents",
  });
  const outstandingDisplay = formatInvoiceMoney({
    amount: totals.outstanding.cents,
    currency: "eur",
    unit: "cents",
  });
  const refundedDisplay = formatInvoiceMoney({
    amount: totals.refunded.cents,
    currency: "eur",
    unit: "cents",
  });
  const cancelledDisplay = formatInvoiceMoney({
    amount: totals.cancelled.cents,
    currency: "eur",
    unit: "cents",
  });

  return (
    <div className="grid grid-cols-1 gap-2 overflow-visible sm:grid-cols-2 lg:grid-cols-4">
      <PatientStatCard
        variant="emerald"
        icon={Banknote}
        title="Paid"
        subtitle="Settled invoices"
        badge={
          totals.paid.count > 0
            ? `${totals.paid.count} paid`
            : undefined
        }
        value={totals.paid.count}
        valueDisplay={paidDisplay}
        valueSkeleton={valueSkeleton}
      />
      <PatientStatCard
        variant="amber"
        icon={CreditCard}
        title="Outstanding"
        subtitle="Draft, sent, or overdue"
        badge={
          totals.outstanding.count > 0
            ? `${totals.outstanding.count} open`
            : undefined
        }
        value={totals.outstanding.count}
        valueDisplay={outstandingDisplay}
        valueSkeleton={valueSkeleton}
      />
      <PatientStatCard
        variant="violet"
        icon={RotateCcw}
        title="Refunded"
        subtitle="Returned to payer"
        badge={
          totals.refunded.count > 0
            ? `${totals.refunded.count} refunded`
            : undefined
        }
        value={totals.refunded.count}
        valueDisplay={refundedDisplay}
        valueSkeleton={valueSkeleton}
      />
      <PatientStatCard
        variant="sky"
        icon={XCircle}
        title="Cancelled"
        subtitle="Voided invoices"
        badge={
          totals.cancelled.count > 0
            ? `${totals.cancelled.count} cancelled`
            : undefined
        }
        value={totals.cancelled.count}
        valueDisplay={cancelledDisplay}
        valueSkeleton={valueSkeleton}
      />
    </div>
  );
}
