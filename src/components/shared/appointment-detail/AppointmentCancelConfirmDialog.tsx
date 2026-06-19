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
import {
  buildAppointmentCancelConfirmSubtitle,
  buildAppointmentCancelConfirmTitle,
} from "@/lib/confirm-delete-dialog-copy";
import { cn } from "@/lib/utils";

type Props = {
  trigger?: ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  role: string | null | undefined;
  userId: string | null | undefined;
  paidInvoice: AppointmentCancelRefundInvoicePick | null;
  confirmPending?: boolean;
  appointmentTitle?: string | null;
  appointmentStart?: string | null;
  appointmentEnd?: string | null;
  patientLabel?: string | null;
  onConfirm: (opts: { refund: boolean; refundInvoiceId?: string }) => void | Promise<void>;
};

const cancelCheckboxClass =
  "mt-px size-4 shrink-0 rounded border-amber-300/80 text-amber-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/60";

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
  appointmentTitle,
  appointmentStart,
  appointmentEnd,
  patientLabel,
  onConfirm,
}: Props) {
  const offerRefund = useMemo(
    () => canOfferRefundOnAppointmentCancel({ role, userId, paidInvoice }),
    [role, userId, paidInvoice]
  );

  const [refundChecked, setRefundChecked] = useState(() =>
    defaultRefundCheckedOnCancel({ role, userId, paidInvoice })
  );
  const [isConfirming, setIsConfirming] = useState(false);
  const pending = confirmPending || isConfirming;

  const refundLabel = paidInvoice ? formatRefundAmountLabel(paidInvoice) : null;

  const dialogTitle = useMemo(
    () => buildAppointmentCancelConfirmTitle(appointmentTitle ?? ""),
    [appointmentTitle]
  );

  const dialogSubtitle = useMemo(
    () =>
      buildAppointmentCancelConfirmSubtitle(appointmentTitle ?? "", {
        start: appointmentStart,
        end: appointmentEnd,
        patientLabel,
      }),
    [appointmentTitle, appointmentStart, appointmentEnd, patientLabel]
  );

  const handleOpenChange = useCallback(
    (next: boolean) => {
      if (next) {
        setRefundChecked(
          defaultRefundCheckedOnCancel({ role, userId, paidInvoice })
        );
      }
      if (!next && pending) return;
      onOpenChange?.(next);
    },
    [pending, onOpenChange, role, userId, paidInvoice]
  );

  const handleConfirm = useCallback(
    async (event: React.MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();
      if (pending) return;
      setIsConfirming(true);
      try {
        await onConfirm({
          refund: offerRefund && refundChecked,
          refundInvoiceId:
            offerRefund && refundChecked && paidInvoice ? paidInvoice.id : undefined,
        });
        onOpenChange?.(false);
      } finally {
        setIsConfirming(false);
      }
    },
    [pending, onConfirm, offerRefund, refundChecked, paidInvoice, onOpenChange]
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
            {dialogTitle}
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-3 text-sm leading-relaxed text-gray-600">
              <p>{dialogSubtitle}</p>
              {offerRefund && refundLabel ? (
                <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-amber-200/80 bg-amber-50/60 px-3 py-2.5">
                  <input
                    type="checkbox"
                    className={cancelCheckboxClass}
                    checked={refundChecked}
                    disabled={pending}
                    onChange={(e) => setRefundChecked(e.target.checked)}
                  />
                  <span className="leading-snug">
                    Also refund{" "}
                    <span className="font-medium text-emerald-700">{refundLabel}</span> to the
                    patient via Stripe.
                  </span>
                </label>
              ) : null}
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="mt-2">
          <AlertDialogCancel
            disabled={pending}
            className="rounded-full border-violet-200/70 bg-white text-violet-700 hover:bg-violet-50 hover:text-violet-800 focus-visible:!ring-0 focus-visible:!ring-offset-0"
          >
            Keep Appointment
          </AlertDialogCancel>
          <AlertDialogAction
            className={cn(
              "rounded-full gap-2 border border-amber-400/55 bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-[0_14px_34px_rgba(245,158,11,0.28)] hover:from-amber-500/95 hover:to-amber-600/95"
            )}
            disabled={pending}
            onClick={handleConfirm}
          >
            {pending ? (
              <Loader2 className="size-4 shrink-0 animate-spin" aria-hidden />
            ) : null}
            {pending ? "Cancelling…" : "Cancel Appointment"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
