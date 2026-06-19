"use client";

import { AlertTriangle } from "lucide-react";
import { InvoiceDeletionActorMeta } from "@/components/shared/billing/InvoiceDeletionActorMeta";
import type { Invoice } from "@/hooks/usePayments";
import { listInvoiceDeletionMetaSlices } from "@/lib/entity-detail-audit-actor";
import { isInvoiceTombstone } from "@/lib/invoice-status-display";
import type { EntityRole } from "@/lib/entity-routes";
import { cn } from "@/lib/utils";

type Props = {
  invoice: Invoice;
  viewerRole: EntityRole;
  className?: string;
};

/** Invoice detail — read-only tombstone notice above definition card (REQ-0114). */
export function InvoiceDetailTombstoneBanner({ invoice, viewerRole, className }: Props) {
  if (!isInvoiceTombstone(invoice)) return null;

  const slices = listInvoiceDeletionMetaSlices(invoice);
  if (slices.length === 0) return null;

  return (
    <div
      role="status"
      className={cn(
        "rounded-lg border border-rose-200 bg-rose-50/90 px-4 py-3 shadow-sm",
        className
      )}
    >
      <div className="mb-2 flex items-center gap-2 text-sm font-medium text-rose-800">
        <AlertTriangle className="h-4 w-4 shrink-0" aria-hidden />
        Read-only billing record
      </div>
      <div className="flex min-w-0 flex-col gap-2">
        {slices.map((slice) => (
          <InvoiceDeletionActorMeta
            key={slice.kind}
            kind={slice.kind}
            at={slice.at}
            actor={slice.actor}
            viewerRole={viewerRole}
          />
        ))}
      </div>
    </div>
  );
}
