"use client";

import { useCallback } from "react";
import { useAppointments } from "@/hooks/useAppointments";
import { usePayments } from "@/hooks/usePayments";
import type { AppointmentDetailApiPayload } from "@/lib/appointment-detail-api";
import type { FullAppointment } from "@/hooks/useAppointments";
import { format } from "date-fns";
import { notify } from "@/lib/notify";

export type CancelAppointmentWithRefundInput = {
  appointmentId: string;
  refundInvoiceId?: string;
};

function formatAppointmentRange(start?: string, end?: string) {
  if (!start || !end) return "Date and time saved.";
  const startDate = new Date(start);
  const endDate = new Date(end);
  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
    return "Date and time saved.";
  }
  return `${format(startDate, "dd.MM.yyyy")} · ${format(startDate, "HH:mm")} - ${format(endDate, "HH:mm")}`;
}

function getSafeAppointmentTitle(appt?: { title?: string | null }) {
  return appt?.title?.trim() ? appt.title : "Untitled";
}

/**
 * Cancel visit then optional Stripe refund — one combined toast when refund runs.
 */
export function useAppointmentCancelWithRefund() {
  const { cancelAppointmentAsync, isCancelling, cancellingAppointmentId } = useAppointments();
  const { refundInvoiceAsync, isRefunding } = usePayments();

  const cancelWithOptionalRefundAsync = useCallback(
    async ({
      appointmentId,
      refundInvoiceId,
    }: CancelAppointmentWithRefundInput): Promise<AppointmentDetailApiPayload> => {
      const data = await cancelAppointmentAsync({
        appointmentId,
        suppressSuccessNotify: Boolean(refundInvoiceId),
      });
      const appt = data.appointment as FullAppointment;

      if (refundInvoiceId) {
        await refundInvoiceAsync({
          invoiceId: refundInvoiceId,
          suppressSuccessNotify: true,
        });
        notify.crud({
          action: "updated",
          entity: "Appointment",
          detail: `"${getSafeAppointmentTitle(appt)}" was cancelled and the invoice was refunded (${formatAppointmentRange(appt?.start, appt?.end)}).`,
        });
      }

      return data;
    },
    [cancelAppointmentAsync, refundInvoiceAsync]
  );

  const isCancelFlowPending = isCancelling || isRefunding;

  return {
    cancelWithOptionalRefundAsync,
    isCancelFlowPending,
    cancellingAppointmentId: isCancelFlowPending ? cancellingAppointmentId : null,
  };
}
