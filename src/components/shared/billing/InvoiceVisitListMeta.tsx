"use client";

import type { InvoiceVisitSummary } from "@/lib/billing-types";
import { invoiceVisitSummaryToMetaInput } from "@/lib/invoice-visit-meta-line";
import { InvoiceVisitMetaLine } from "@/components/shared/billing/InvoiceVisitMetaLine";

type Props = {
  summary: InvoiceVisitSummary;
  className?: string;
};

/** @deprecated Prefer `InvoiceVisitMetaLine` — thin wrapper for visit summary shape. */
export function InvoiceVisitListMeta({ summary, className }: Props) {
  return (
    <InvoiceVisitMetaLine
      source={invoiceVisitSummaryToMetaInput(summary)}
      variant="icons"
      className={className}
    />
  );
}
