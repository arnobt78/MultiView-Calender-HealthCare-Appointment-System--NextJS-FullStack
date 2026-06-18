"use client";

import { useCallback, useMemo, useState, type ReactNode } from "react";
import { AlertTriangle, Loader2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  canOfferRefundOnAppointmentCancel,
  defaultRefundCheckedOnCancel,
  formatRefundAmountLabel,
  type AppointmentCancelRefundInvoicePick,
} from "@/lib/appointment-cancel-refund";
import { cn } from "@/lib/utils";

type Props = {
  trigger?: ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  role: string | null | undefined;
  userId: string | null | undefined;
  paidInvoice: AppointmentCancelRefundInvoicePick | null;
  confirmPending?: boolean;
  onConfirm: (opts: { refund: boolean; refundInvoiceId?: string }) => void | Promise<void>;
};

const cancelCheckboxClass =
  "size-4 shrink-0 rounded border-amber-300/80 text-amber-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/60";

/**
 * Cancel visit confirm — optional default-on Stripe refund when paid invoice + mutate access.
 */
export function AppointmentCancelConfirmDialog({
  trigger,
  open,
  onOpenChange,
  role,
  userId,
  paidInvoice,
  confirmPending = false,
  onConfirm,
}: Props) {
  const offerRefund = useMemo(
    () => canOfferRefundOnAppointmentCancel({ role, userId, paidInvoice }),
    [role, userId, paidInvoice]
  );

  const [refundChecked, setRefundChecked] = useState(() =>
    defaultRefundCheckedOnCancel({ role, userId, paidInvoice })
  );

  const refundLabel = paidInvoice ? formatRefundAmountLabel(paidInvoice) : null;

  const handleOpenChange = useCallback(
    (next: boolean) => {
      if (next) {
        setRefundChecked(
          defaultRefundCheckedOnCancel({ role, userId, paidInvoice })
        );
      }
      if (!next && confirmPending) return;
      onOpenChange?.(next);
    },
    [confirmPending, onOpenChange, role, userId, paidInvoice]
  );

  const handleConfirm = useCallback(
    async (event: React.MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();
      if (confirmPending) return;
      await onConfirm({
        refund: offerRefund && refundChecked,
        refundInvoiceId:
          offerRefund && refundChecked && paidInvoice ? paidInvoice.id : undefined,
      });
    },
    [confirmPending, onConfirm, offerRefund, refundChecked, paidInvoice]
  );

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      {trigger ? <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger> : null}
      <AlertDialogContent className="rounded-[24px] border border-white/20 bg-white/95 p-6 shadow-[0_26px_70px_rgba(15,23,42,0.24)]">
        <AlertDialogHeader className="gap-2">
          <AlertDialogMedia className="size-14 rounded-2xl border border-amber-300/55 bg-gradient-to-br from-amber-500/25 via-amber-500/12 to-amber-500/8 shadow-[0_18px_40px_rgba(245,158,11,0.22)]">
            <AlertTriangle className="size-7 text-amber-700" />
          </AlertDialogMedia>
          <AlertDialogTitle className="text-lg font-semibold text-gray-700">
            Cancel appointment?
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-3 text-sm leading-relaxed text-gray-600">
              <p>
                This visit will be marked cancelled. Stakeholders will be notified.
              </p>
              {offerRefund && refundLabel ? (
                <label className="flex cursor-pointer items-start gap-2.5 rounded-xl border border-amber-200/80 bg-amber-50/60 px-3 py-2.5">
                  <input
                    type="checkbox"
                    className={cancelCheckboxClass}
                    checked={refundChecked}
                    onChange={(e) => setRefundChecked(e.target.checked)}
                  />
                  <span>
                    Also refund{" "}
                    <span className="font-medium text-gray-800">{refundLabel}</span> to the
                    patient via Stripe.
                  </span>
                </label>
              ) : null}
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="mt-2">
          <AlertDialogCancel
            disabled={confirmPending}
            className="rounded-full border-violet-200/70 bg-white text-violet-700 hover:bg-violet-50 hover:text-violet-800 focus-visible:!ring-0 focus-visible:!ring-offset-0"
          >
            Keep visit
          </AlertDialogCancel>
          <AlertDialogAction
            className={cn(
              "rounded-full gap-2 border border-amber-400/55 bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-[0_14px_34px_rgba(245,158,11,0.28)] hover:from-amber-500/95 hover:to-amber-600/95"
            )}
            disabled={confirmPending}
            onClick={handleConfirm}
          >
            {confirmPending ? (
              <Loader2 className="size-4 shrink-0 animate-spin" aria-hidden />
            ) : null}
            {confirmPending ? "Cancelling…" : "Cancel Appointment"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
