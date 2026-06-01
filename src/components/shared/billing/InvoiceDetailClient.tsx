"use client";

import { usePayments, type Invoice } from "@/hooks/usePayments";
import { useInvoice } from "@/hooks/useInvoice";
import { Button } from "@/components/ui/button";
import { InvoiceAdminActionsMenu } from "@/components/shared/billing/InvoiceAdminActionsMenu";
import { InvoiceStatusBadge } from "@/components/shared/billing/InvoiceStatusBadge";

type Props = {
  invoice: Invoice;
  accessLevel: "admin" | "view" | "mutate" | "pay";
};

/** Admin/doctor/patient footer actions on SSR invoice detail — useInvoice keeps footer in sync after CRUD. */
export function InvoiceDetailClient({ invoice: initialInvoice, accessLevel }: Props) {
  const { data: invoice = initialInvoice } = useInvoice(initialInvoice.id, {
    initialData: initialInvoice,
  });
  const {
    pay,
    isPaying,
    updateInvoice,
    recordPayment,
    refundInvoice,
    deleteInvoice,
    isUpdating,
    isRecording,
    isRefunding,
    isDeleting,
  } = usePayments();

  const busy = isUpdating || isRecording || isRefunding || isDeleting;

  if (accessLevel === "pay") {
    return (
      <div className="flex items-center gap-2">
        <InvoiceStatusBadge status={invoice.status} />
        <Button size="sm" disabled={isPaying} onClick={() => pay(invoice.id)}>
          Pay via Stripe
        </Button>
      </div>
    );
  }

  if (accessLevel === "view") {
    return <InvoiceStatusBadge status={invoice.status} />;
  }

  if (accessLevel === "mutate") {
    return (
      <div className="flex flex-wrap items-center gap-2">
        <InvoiceStatusBadge status={invoice.status} />
        <InvoiceAdminActionsMenu
          invoice={invoice}
          viewerRole="doctor"
          onSend={(id) => updateInvoice({ invoiceId: id, body: { status: "sent" } })}
          onDelete={deleteInvoice}
          isUpdating={busy}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <InvoiceStatusBadge status={invoice.status} />
      <InvoiceAdminActionsMenu
        invoice={invoice}
        viewerRole="admin"
        onPay={pay}
        onSend={(id) => updateInvoice({ invoiceId: id, body: { status: "sent" } })}
        onMarkPaid={recordPayment}
        onCancel={(id) => updateInvoice({ invoiceId: id, body: { status: "cancelled" } })}
        onDelete={deleteInvoice}
        onRefund={refundInvoice}
        isPaying={isPaying}
        isUpdating={busy}
      />
    </div>
  );
}
