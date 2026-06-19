"use client";

import { useCallback, useState } from "react";
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
 * Tracks pendingFlowAppointmentId for full cancel+refund span (REQ-0113).
 */
export function useAppointmentCancelWithRefund() {
  const { cancelAppointmentAsync, isCancelling } = useAppointments();
  const { refundInvoiceAsync, isRefunding } = usePayments();
  const [pendingFlowAppointmentId, setPendingFlowAppointmentId] = useState<string | null>(
    null
  );

  const cancelWithOptionalRefundAsync = useCallback(
    async ({
      appointmentId,
      refundInvoiceId,
    }: CancelAppointmentWithRefundInput): Promise<AppointmentDetailApiPayload> => {
      setPendingFlowAppointmentId(appointmentId);
      try {
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
      } finally {
        setPendingFlowAppointmentId(null);
      }
    },
    [cancelAppointmentAsync, refundInvoiceAsync]
  );

  const isCancelFlowPending = isCancelling || isRefunding || Boolean(pendingFlowAppointmentId);

  const isCancelFlowPendingFor = useCallback(
    (appointmentId: string) =>
      isCancelFlowPending && pendingFlowAppointmentId === appointmentId,
    [isCancelFlowPending, pendingFlowAppointmentId]
  );

  return {
    cancelWithOptionalRefundAsync,
    isCancelFlowPending,
    isCancelFlowPendingFor,
    pendingFlowAppointmentId,
  };
}
