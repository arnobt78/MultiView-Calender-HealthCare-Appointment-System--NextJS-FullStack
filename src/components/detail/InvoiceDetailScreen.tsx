/**
 * Invoice detail body — shared by CP admin route and portal `/invoices/[id]` (doctor/patient).
 */

import { BackNavigationLink } from "@/components/shared/BackNavigationLink";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
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
};

export function InvoiceDetailScreen({
  clientInvoice,
  uiAccess,
  backHref,
  viewerRole,
  variant,
}: Props) {
  return (
    <div className="space-y-2">
      <InvoiceDetailQuerySeed invoice={clientInvoice} />
      <InvoiceDetailLiveBody
        initialInvoice={clientInvoice}
        uiAccess={uiAccess}
        viewerRole={viewerRole}
        variant={variant}
        headerActions={
          <Button variant="outline" asChild>
            <BackNavigationLink href={backHref}>
              <ArrowLeft className="h-4 w-4" />
              Back
            </BackNavigationLink>
          </Button>
        }
      />
    </div>
  );
}
