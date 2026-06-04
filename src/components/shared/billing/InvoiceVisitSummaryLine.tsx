"use client";

import type { InvoiceVisitSummary } from "@/lib/billing-types";
import { InvoiceVisitMetaLine } from "@/components/shared/billing/InvoiceVisitMetaLine";
import { invoiceVisitSummaryToMetaInput } from "@/lib/invoice-visit-meta-line";
import { cn } from "@/lib/utils";

type Props = {
  summary?: InvoiceVisitSummary | null;
  className?: string;
};

/** Visit when/location/telehealth icons — shared under invoice titles (CP, org billing, patient snapshot). */
export function InvoiceVisitSummaryLine({ summary, className }: Props) {
  if (!summary) return null;
  return (
    <InvoiceVisitMetaLine
      source={invoiceVisitSummaryToMetaInput(summary)}
      variant="icons"
      className={cn("text-[10px]", className)}
    />
  );
}
