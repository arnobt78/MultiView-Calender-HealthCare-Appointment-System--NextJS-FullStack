"use client";

import { usePayments, type Invoice } from "@/hooks/usePayments";
import { useInvoice } from "@/hooks/useInvoice";
import { Button } from "@/components/ui/button";
import { InvoiceAdminActionsMenu } from "@/components/shared/billing/InvoiceAdminActionsMenu";
import { InvoiceStatusBadge } from "@/components/shared/billing/InvoiceStatusBadge";
import { useInvoiceFormDialogOptional } from "@/context/InvoiceFormDialogContext";
import { useInvoiceFormDialogController } from "@/hooks/useInvoiceFormDialogController";

type Props = {
  invoice: Invoice;
  accessLevel: "admin" | "view" | "mutate" | "pay";
  /** Hide redundant View link when already on detail page. */
  hideViewLink?: boolean;
  /** SSR invoices.all seed — pairs with InvoiceDetailQuerySeed. */
  invoicesInitialData?: Invoice[];
};

/** Admin/doctor/patient footer actions on invoice detail — useInvoice keeps menu in sync after CRUD. */
export function InvoiceDetailClient({
  invoice: initialInvoice,
  accessLevel,
  hideViewLink = false,
  invoicesInitialData,
}: Props) {
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
  } = usePayments({ invoicesInitialData });

  const ctx = useInvoiceFormDialogOptional();
  const local = useInvoiceFormDialogController({
    variant: accessLevel === "admin" ? "admin" : "doctor",
  });
  const { openEdit, dialogNode } = ctx ?? local;

  const busy = isUpdating || isRecording || isRefunding || isDeleting;

  const menuProps = {
    invoice,
    hideViewLink,
    onEdit: openEdit,
    isUpdating: busy,
  };

  let actions: React.ReactNode;

  if (accessLevel === "pay") {
    actions = (
      <div className="flex items-center gap-2">
        <InvoiceStatusBadge invoice={invoice} />
        <Button size="sm" disabled={isPaying} onClick={() => pay(invoice.id)}>
          Pay via Stripe
        </Button>
      </div>
    );
  } else if (accessLevel === "view") {
    actions = <InvoiceStatusBadge invoice={invoice} />;
  } else if (accessLevel === "mutate") {
    actions = (
      <div className="flex flex-wrap items-center gap-2">
        <InvoiceStatusBadge invoice={invoice} />
        <InvoiceAdminActionsMenu
          {...menuProps}
          viewerRole="doctor"
          onSend={(id) => updateInvoice({ invoiceId: id, body: { status: "sent" } })}
          onDelete={deleteInvoice}
        />
      </div>
    );
  } else {
    actions = (
      <div className="flex flex-wrap items-center gap-2">
        <InvoiceStatusBadge invoice={invoice} />
        <InvoiceAdminActionsMenu
          {...menuProps}
          viewerRole="admin"
          onPay={pay}
          onSend={(id) => updateInvoice({ invoiceId: id, body: { status: "sent" } })}
          onMarkPaid={recordPayment}
          onCancel={(id) => updateInvoice({ invoiceId: id, body: { status: "cancelled" } })}
          onDelete={deleteInvoice}
          onRefund={refundInvoice}
          isPaying={isPaying}
        />
      </div>
    );
  }

  return (
    <>
      {actions}
      {!ctx ? dialogNode : null}
    </>
  );
}
