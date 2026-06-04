"use client";

import type { Invoice } from "@/hooks/usePayments";
import { InvoiceDetailActionBar } from "@/components/shared/billing/InvoiceDetailActionBar";
import type { InvoiceDetailUiAccess } from "@/lib/invoice-detail-ssr";

type Props = {
  invoice: Invoice;
  accessLevel: InvoiceDetailUiAccess;
  backHref: string;
  backLabel?: string;
  /** SSR invoices.all seed — pairs with InvoiceDetailQuerySeed. */
  invoicesInitialData?: Invoice[];
};

/** @deprecated Prefer `InvoiceDetailActionBar` on invoice detail pages. */
export function InvoiceDetailClient({
  invoice,
  accessLevel,
  backHref,
  backLabel,
  invoicesInitialData,
}: Props) {
  return (
    <InvoiceDetailActionBar
      initialInvoice={invoice}
      accessLevel={accessLevel}
      backHref={backHref}
      backLabel={backLabel}
      invoicesInitialData={invoicesInitialData}
    />
  );
}
