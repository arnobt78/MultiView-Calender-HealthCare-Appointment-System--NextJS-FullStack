"use client";

import { useState } from "react";
import Link from "next/link";
import {
  MoreHorizontal,
  EllipsisVertical,
  CreditCard,
  Send,
  CheckCircle2,
  Ban,
  Trash2,
  RotateCcw,
  Eye,
  Pencil,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ConfirmActionDialog } from "@/components/shared/ConfirmActionDialog";
import type { Invoice } from "@/hooks/usePayments";
import {
  buildInvoiceDeleteConfirmSubtitle,
  DELETE_INVOICE_CONFIRM_TITLE,
} from "@/lib/confirm-delete-dialog-copy";
import { invoiceDetailHref } from "@/lib/entity-routes";
import {
  INVOICE_LIST_ACTIONS_MENU_ICON,
  invoiceActionsMenuTriggerClassName,
} from "@/lib/billing-ui-presets";
import { cn } from "@/lib/utils";

type Props = {
  invoice: Invoice;
  viewerRole: "admin" | "doctor";
  onPay?: (id: string) => void;
  onSend?: (id: string) => void;
  onMarkPaid?: (id: string) => void;
  onCancel?: (id: string) => void;
  onDelete?: (id: string) => void;
  onRefund?: (id: string) => void;
  onEdit?: (invoice: Invoice) => void;
  isPaying?: boolean;
  isUpdating?: boolean;
  /** When true, omit View link (detail page). */
  hideViewLink?: boolean;
  /** Defaults to vertical ⋮ — CP patient list parity; pass `horizontal` for dense toolbars only. */
  menuIcon?: "horizontal" | "vertical";
  triggerClassName?: string;
};

export function InvoiceAdminActionsMenu({
  invoice,
  viewerRole,
  onPay,
  onSend,
  onMarkPaid,
  onCancel,
  onDelete,
  onRefund,
  onEdit,
  isPaying,
  isUpdating,
  hideViewLink = false,
  menuIcon = INVOICE_LIST_ACTIONS_MENU_ICON,
  triggerClassName,
}: Props) {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const MenuIcon = menuIcon === "vertical" ? EllipsisVertical : MoreHorizontal;
  const canPay =
    viewerRole === "admin" &&
    (invoice.status === "draft" || invoice.status === "sent" || invoice.status === "overdue");
  const canSend = invoice.status === "draft";
  const canMarkPaid = invoice.status !== "paid" && invoice.status !== "cancelled";
  const canCancel = invoice.status !== "paid" && invoice.status !== "cancelled";
  const canDelete = invoice.status !== "paid";
  const canRefund = viewerRole === "admin" && invoice.status === "paid";
  const canEditDetails =
    Boolean(onEdit) &&
    (invoice.status === "draft" || invoice.status === "sent" || invoice.status === "overdue");

  return (
    <>
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn(invoiceActionsMenuTriggerClassName, triggerClassName)}
        >
          <MenuIcon className="h-4 w-4" aria-hidden />
          <span className="sr-only">Open invoice menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {!hideViewLink && (
          <DropdownMenuItem asChild>
            <Link href={invoiceDetailHref(viewerRole, invoice.id)} className="gap-2">
              <Eye className="h-4 w-4" /> View
            </Link>
          </DropdownMenuItem>
        )}
        {canEditDetails && onEdit && (
          <DropdownMenuItem
            className="gap-2"
            disabled={isUpdating}
            onClick={() => onEdit(invoice)}
          >
            <Pencil className="h-4 w-4" /> Edit details
          </DropdownMenuItem>
        )}
        {canSend && onSend && (
          <DropdownMenuItem
            className="gap-2"
            disabled={isUpdating}
            onClick={() => onSend(invoice.id)}
          >
            <Send className="h-4 w-4" /> Send to patient
          </DropdownMenuItem>
        )}
        {canMarkPaid && onMarkPaid && viewerRole === "admin" && (
          <DropdownMenuItem
            className="gap-2"
            disabled={isUpdating}
            onClick={() => onMarkPaid(invoice.id)}
          >
            <CheckCircle2 className="h-4 w-4" /> Mark paid (manual)
          </DropdownMenuItem>
        )}
        {canPay && onPay && (
          <DropdownMenuItem
            className="gap-2"
            disabled={isPaying}
            onClick={() => onPay(invoice.id)}
          >
            <CreditCard className="h-4 w-4" /> Pay via Stripe
          </DropdownMenuItem>
        )}
        {canCancel && onCancel && (
          <DropdownMenuItem
            className="gap-2 text-amber-700"
            disabled={isUpdating}
            onClick={() => onCancel(invoice.id)}
          >
            <Ban className="h-4 w-4" /> Cancel
          </DropdownMenuItem>
        )}
        {canRefund && onRefund && (
          <DropdownMenuItem
            className="gap-2"
            disabled={isUpdating}
            onClick={() => onRefund(invoice.id)}
          >
            <RotateCcw className="h-4 w-4" /> Refund
          </DropdownMenuItem>
        )}
        {canDelete && onDelete && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="gap-2 text-red-600 focus:text-red-600"
              disabled={isUpdating}
              onSelect={(e) => {
                e.preventDefault();
                setDeleteOpen(true);
              }}
            >
              <Trash2 className="h-4 w-4" /> Delete
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
    {canDelete && onDelete ? (
      <ConfirmActionDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        variant="destructive"
        title={DELETE_INVOICE_CONFIRM_TITLE}
        subtitle={buildInvoiceDeleteConfirmSubtitle(invoice)}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        confirmDisabled={isUpdating}
        onConfirm={() => {
          onDelete(invoice.id);
          setDeleteOpen(false);
        }}
      />
    ) : null}
    </>
  );
}
