"use client";

import { formatInvoiceMoney } from "@/lib/crud-notify-messages";

type Props = {
  amountCents: number;
  currency?: string;
  className?: string;
};

/** Display invoice amount stored in cents. */
export function InvoiceAmountDisplay({
  amountCents,
  currency = "eur",
  className,
}: Props) {
  const label = formatInvoiceMoney({
    amount: amountCents,
    currency,
    unit: "cents",
  });
  return <span className={className}>{label}</span>;
}
