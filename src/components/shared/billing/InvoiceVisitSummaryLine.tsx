"use client";

import type { InvoiceVisitSummary } from "@/lib/billing-types";
import { formatInvoiceVisitSummaryLine } from "@/lib/invoice-visit-summary";
import { cn } from "@/lib/utils";

type Props = {
  summary?: InvoiceVisitSummary | null;
  className?: string;
};

/** Compact visit context under invoice title in list cards/tables. */
export function InvoiceVisitSummaryLine({ summary, className }: Props) {
  if (!summary) return null;
  return (
    <p className={cn("text-[10px] text-muted-foreground line-clamp-2", className)}>
      {formatInvoiceVisitSummaryLine(summary)}
    </p>
  );
}
