"use client";

import { useMemo, useState } from "react";
import {
  Ban,
  CheckCircle2,
  CreditCard,
  List,
  Pencil,
  RotateCcw,
  Send,
  Trash2,
} from "lucide-react";
import { BackNavigationLink } from "@/components/shared/BackNavigationLink";
import { ControlPanelGlassActionButton } from "@/components/shared/ControlPanelGlassActionButton";
import { ConfirmActionDialog } from "@/components/shared/ConfirmActionDialog";
import { usePayments, type Invoice } from "@/hooks/usePayments";
import { useInvoice } from "@/hooks/useInvoice";
import { useInvoiceFormDialogOptional } from "@/context/InvoiceFormDialogContext";
import { useInvoiceFormDialogController } from "@/hooks/useInvoiceFormDialogController";
import {
  buildInvoiceDeleteConfirmSubtitle,
  DELETE_INVOICE_CONFIRM_TITLE,
} from "@/lib/confirm-delete-dialog-copy";
import { resolveInvoiceDetailActionCapabilities } from "@/lib/invoice-detail-action-capabilities";
import type { InvoiceDetailUiAccess } from "@/lib/invoice-detail-ssr";
import { invoiceDetailActionsRowClass, invoiceDetailBackButtonClass } from "@/lib/invoice-detail-ui-classes";
import { cn } from "@/lib/utils";

type Props = {
  initialInvoice: Invoice;
  accessLevel: InvoiceDetailUiAccess;
  backHref: string;
  backLabel?: string;
  invoicesInitialData?: Invoice[];
};

/**
 * Invoice detail footer — glass inline actions (parity with patient/category footers).
 */
export function InvoiceDetailActionBar({
  initialInvoice,
  accessLevel,
  backHref,
  backLabel = "Back To List",
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

  const [deleteOpen, setDeleteOpen] = useState(false);
  const busy = isUpdating || isRecording || isRefunding || isDeleting;

  const viewerRole = accessLevel === "admin" ? "admin" : "doctor";
  const caps = useMemo(
    () => resolveInvoiceDetailActionCapabilities(invoice, viewerRole),
    [invoice, viewerRole]
  );
  const canEditDetails = caps.canEditDetails && (accessLevel === "admin" || accessLevel === "mutate");

  return (
    <>
      <div className={invoiceDetailActionsRowClass}>
        <BackNavigationLink href={backHref} className={cn(invoiceDetailBackButtonClass, "no-underline")}>
          <List className="shrink-0" aria-hidden />
          {backLabel}
        </BackNavigationLink>

        {accessLevel === "view" ? null : (
          <div className="flex flex-wrap gap-2">
            {accessLevel === "pay" ? (
              <ControlPanelGlassActionButton
                type="button"
                variant="emerald"
                disabled={isPaying}
                onClick={() => pay(invoice.id)}
              >
                <CreditCard className="shrink-0" aria-hidden />
                {isPaying ? "Processing…" : "Pay via Stripe"}
              </ControlPanelGlassActionButton>
            ) : null}

            {canEditDetails ? (
              <ControlPanelGlassActionButton
                type="button"
                variant="emerald"
                disabled={busy}
                onClick={() => openEdit(invoice)}
              >
                <Pencil className="shrink-0" aria-hidden />
                Edit details
              </ControlPanelGlassActionButton>
            ) : null}

            {accessLevel === "admin" && caps.canSend ? (
              <ControlPanelGlassActionButton
                type="button"
                variant="sky"
                disabled={busy}
                onClick={() => updateInvoice({ invoiceId: invoice.id, body: { status: "sent" } })}
              >
                <Send className="shrink-0" aria-hidden />
                Send to patient
              </ControlPanelGlassActionButton>
            ) : null}

            {accessLevel === "admin" && caps.canMarkPaid ? (
              <ControlPanelGlassActionButton
                type="button"
                variant="emerald"
                disabled={busy}
                onClick={() => recordPayment(invoice.id)}
              >
                <CheckCircle2 className="shrink-0" aria-hidden />
                Mark paid (manual)
              </ControlPanelGlassActionButton>
            ) : null}

            {accessLevel === "admin" && caps.canPay ? (
              <ControlPanelGlassActionButton
                type="button"
                variant="violet"
                disabled={isPaying}
                onClick={() => pay(invoice.id)}
              >
                <CreditCard className="shrink-0" aria-hidden />
                Pay via Stripe
              </ControlPanelGlassActionButton>
            ) : null}

            {accessLevel === "mutate" && caps.canSend ? (
              <ControlPanelGlassActionButton
                type="button"
                variant="sky"
                disabled={busy}
                onClick={() => updateInvoice({ invoiceId: invoice.id, body: { status: "sent" } })}
              >
                <Send className="shrink-0" aria-hidden />
                Send to patient
              </ControlPanelGlassActionButton>
            ) : null}

            {caps.canCancel && (accessLevel === "admin" || accessLevel === "mutate") ? (
              <ControlPanelGlassActionButton
                type="button"
                variant="sky"
                disabled={busy}
                onClick={() =>
                  updateInvoice({ invoiceId: invoice.id, body: { status: "cancelled" } })
                }
              >
                <Ban className="shrink-0" aria-hidden />
                Cancel
              </ControlPanelGlassActionButton>
            ) : null}

            {accessLevel === "admin" && caps.canRefund ? (
              <ControlPanelGlassActionButton
                type="button"
                variant="sky"
                disabled={busy}
                onClick={() => refundInvoice(invoice.id)}
              >
                <RotateCcw className="shrink-0" aria-hidden />
                Refund
              </ControlPanelGlassActionButton>
            ) : null}

            {caps.canDelete && (accessLevel === "admin" || accessLevel === "mutate") ? (
              <ConfirmActionDialog
                open={deleteOpen}
                onOpenChange={setDeleteOpen}
                variant="destructive"
                title={DELETE_INVOICE_CONFIRM_TITLE}
                subtitle={buildInvoiceDeleteConfirmSubtitle(invoice)}
                confirmLabel="Delete"
                cancelLabel="Cancel"
                confirmDisabled={busy}
                onConfirm={() => {
                  deleteInvoice(invoice.id);
                  setDeleteOpen(false);
                }}
                trigger={
                  <ControlPanelGlassActionButton type="button" variant="rose" disabled={busy}>
                    <Trash2 className="shrink-0" aria-hidden />
                    {isDeleting ? "Deleting…" : "Delete"}
                  </ControlPanelGlassActionButton>
                }
              />
            ) : null}
          </div>
        )}
      </div>
      {!ctx ? dialogNode : null}
    </>
  );
}
