"use client";

import Link from "next/link";
import {
  MoreHorizontal,
  CreditCard,
  Send,
  CheckCircle2,
  Ban,
  Trash2,
  RotateCcw,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import type { Invoice } from "@/hooks/usePayments";
import { invoiceDetailHref } from "@/lib/entity-routes";

type Props = {
  invoice: Invoice;
  viewerRole: "admin" | "doctor";
  onPay?: (id: string) => void;
  onSend?: (id: string) => void;
  onMarkPaid?: (id: string) => void;
  onCancel?: (id: string) => void;
  onDelete?: (id: string) => void;
  onRefund?: (id: string) => void;
  isPaying?: boolean;
  isUpdating?: boolean;
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
  isPaying,
  isUpdating,
}: Props) {
  const canPay =
    viewerRole === "admin" &&
    (invoice.status === "draft" || invoice.status === "sent" || invoice.status === "overdue");
  const canSend = invoice.status === "draft";
  const canMarkPaid = invoice.status !== "paid" && invoice.status !== "cancelled";
  const canCancel = invoice.status !== "paid" && invoice.status !== "cancelled";
  const canDelete = invoice.status !== "paid";
  const canRefund = viewerRole === "admin" && invoice.status === "paid";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <Link href={invoiceDetailHref(viewerRole, invoice.id)} className="gap-2">
            <Eye className="h-4 w-4" /> View
          </Link>
        </DropdownMenuItem>
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
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <DropdownMenuItem
                  className="text-red-600 focus:text-red-600"
                  onSelect={(e) => e.preventDefault()}
                >
                  <Trash2 className="h-4 w-4" /> Delete
                </DropdownMenuItem>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete invoice?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Permanently delete invoice #{invoice.id.slice(0, 8)}.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-red-600 hover:bg-red-700"
                    onClick={() => onDelete(invoice.id)}
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
