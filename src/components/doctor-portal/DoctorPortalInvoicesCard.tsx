"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Receipt } from "lucide-react";
import { usePayments } from "@/hooks/usePayments";
import { PortalPanelSection } from "@/components/shared/PortalPanelSection";
import { CreateInvoiceDialog } from "@/components/shared/billing/CreateInvoiceDialog";
import { InvoiceStatusBadge } from "@/components/shared/billing/InvoiceStatusBadge";
import { InvoiceAmountDisplay } from "@/components/shared/billing/InvoiceAmountDisplay";
import { InvoiceVisitSummaryLine } from "@/components/shared/billing/InvoiceVisitSummaryLine";
import { InvoiceAdminActionsMenu } from "@/components/shared/billing/InvoiceAdminActionsMenu";
import { Skeleton } from "@/components/ui/skeleton";

type Props = {
  listBodyLoading?: boolean;
};

/** Doctor-scoped invoices — create draft + send; list from role-aware GET /api/invoices. */
export function DoctorPortalInvoicesCard({ listBodyLoading }: Props) {
  const {
    invoices,
    isLoading,
    createInvoice,
    updateInvoice,
    deleteInvoice,
    isUpdating,
  } = usePayments();

  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    requestAnimationFrame(() => setIsMounted(true));
  }, []);

  const loading = listBodyLoading || !isMounted || isLoading;
  const outstanding = invoices.filter(
    (i) => i.status !== "paid" && i.status !== "cancelled"
  ).length;

  return (
    <PortalPanelSection
      id="dp-invoices-heading"
      title="Billing"
      subtitle="Draft invoices for your visits"
      icon={Receipt}
      count={loading ? undefined : invoices.length}
      headerSlot={
        <div className="flex w-full flex-wrap items-center justify-between gap-2">
          <span className="text-sm font-semibold text-gray-800">Billing</span>
          <CreateInvoiceDialog
            variant="doctor"
            triggerLabel="New draft"
            onCreate={(body) => createInvoice(body)}
          />
        </div>
      }
    >
      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full rounded-lg" />
          ))}
        </div>
      ) : invoices.length === 0 ? (
        <p className="text-sm text-muted-foreground">No invoices yet.</p>
      ) : (
        <ul className="space-y-2">
          {invoices.slice(0, 8).map((inv) => (
            <li
              key={inv.id}
              className="flex items-center justify-between gap-2 rounded-lg border bg-card px-3 py-2 text-xs"
            >
              <div className="min-w-0">
                <p className="truncate font-medium">
                  {inv.description ?? `Invoice #${inv.id.slice(0, 8)}`}
                </p>
                <p className="text-[10px] text-muted-foreground">
                  {format(new Date(inv.created_at), "dd MMM yyyy")}
                  {outstanding > 0 ? ` · ${outstanding} open` : ""}
                </p>
                <InvoiceVisitSummaryLine summary={inv.visit_summary} />
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <InvoiceAmountDisplay amountCents={inv.amount} currency={inv.currency} />
                <InvoiceStatusBadge invoice={inv} />
                <InvoiceAdminActionsMenu
                  invoice={inv}
                  viewerRole="doctor"
                  onSend={(id) =>
                    updateInvoice({ invoiceId: id, body: { status: "sent" } })
                  }
                  onDelete={deleteInvoice}
                  isUpdating={isUpdating}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </PortalPanelSection>
  );
}
