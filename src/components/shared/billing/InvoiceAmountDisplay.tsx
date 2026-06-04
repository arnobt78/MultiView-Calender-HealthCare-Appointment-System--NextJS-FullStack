"use client";

import { formatInvoiceMoney } from "@/lib/crud-notify-messages";
import { invoiceAmountTextClassForStatus } from "@/lib/invoice-status-display";
import {
  resolveInvoiceDisplayStatus,
  type InvoiceDisplayStatus,
  type InvoiceForDisplay,
} from "@/lib/billing-appointment-eligibility";
import { cn } from "@/lib/utils";

type Props = {
  amountCents: number;
  currency?: string;
  className?: string;
  /** When set, amount text follows status badge colors. */
  status?: string;
  invoice?: InvoiceForDisplay;
  displayStatus?: InvoiceDisplayStatus | string;
};

/** Display invoice amount stored in cents. */
export function InvoiceAmountDisplay({
  amountCents,
  currency = "eur",
  className,
  status,
  invoice,
  displayStatus,
}: Props) {
  const label = formatInvoiceMoney({
    amount: amountCents,
    currency,
    unit: "cents",
  });
  const resolved =
    displayStatus ??
    (invoice ? resolveInvoiceDisplayStatus(invoice) : (status ?? null));
  const statusColor =
    resolved != null ? invoiceAmountTextClassForStatus(resolved) : undefined;

  return (
    <span className={cn(statusColor, "font-semibold tabular-nums", className)}>{label}</span>
  );
}
