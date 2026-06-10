/**
 * Invoice detail body — shared by CP admin route and portal `/invoices/[id]` (doctor/patient).
 */

import { InvoiceDetailQuerySeed } from "@/components/shared/billing/InvoiceDetailQuerySeed";
import { InvoiceDetailLiveBody } from "@/components/shared/billing/InvoiceDetailLiveBody";
import type { InvoiceDetailUiAccess } from "@/lib/invoice-detail-ssr";
import type { Invoice } from "@/hooks/usePayments";
import type { EntityRole } from "@/lib/entity-routes";

type Props = {
  clientInvoice: Invoice;
  uiAccess: InvoiceDetailUiAccess;
  backHref: string;
  viewerRole: EntityRole;
  /** CP uses control-panel appointment link; portal uses role-aware href. */
  variant: "control-panel" | "portal";
  /** SSR list — seeds invoices.all for detail actions without extra client fetch. */
  initialInvoicesList?: Invoice[] | null;
};

export function InvoiceDetailScreen({
  clientInvoice,
  uiAccess,
  backHref,
  viewerRole,
  variant,
  initialInvoicesList,
}: Props) {
  return (
    <>
      <InvoiceDetailQuerySeed
        invoice={clientInvoice}
        initialInvoicesList={initialInvoicesList}
      />
      <InvoiceDetailLiveBody
        initialInvoice={clientInvoice}
        initialInvoicesList={initialInvoicesList}
        uiAccess={uiAccess}
        viewerRole={viewerRole}
        variant={variant}
        backHref={backHref}
      />
    </>
  );
}
