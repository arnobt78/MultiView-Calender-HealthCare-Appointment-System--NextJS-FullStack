import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient, handleApiError } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";
import {
  getPatientIdFromAppointmentCache,
  getPatientIdFromInvoiceCache,
  invalidateInvoicesAndOverview,
} from "@/lib/query-client";
import { notify } from "@/lib/notify";
import {
  formatInvoiceMoney,
  invoiceCrudMessage,
} from "@/lib/crud-notify-messages";
import type { InvoiceRow, InvoicePaymentRow } from "@/lib/billing-types";

export type InvoicePayment = InvoicePaymentRow;
export type Invoice = InvoiceRow;

async function invalidateAfterInvoiceWrite(
  queryClient: ReturnType<typeof useQueryClient>,
  opts?: { invoiceId?: string; appointmentId?: string | null }
) {
  const patientId = opts?.appointmentId
    ? getPatientIdFromAppointmentCache(queryClient, opts.appointmentId)
    : opts?.invoiceId
      ? getPatientIdFromInvoiceCache(queryClient, opts.invoiceId)
      : undefined;
  await invalidateInvoicesAndOverview(queryClient, {
    patientId: patientId ?? undefined,
    invoiceId: opts?.invoiceId ?? undefined,
  });
}

export function usePayments() {
  const queryClient = useQueryClient();

  const invoicesQuery = useQuery({
    queryKey: queryKeys.invoices.all,
    queryFn: async () => {
      const data = await apiClient<{ invoices: Invoice[] }>("/api/payments");
      return data.invoices || [];
    },
    staleTime: 30_000,
  });

  const payMutation = useMutation({
    mutationFn: async (invoiceId: string) => {
      const data = await apiClient<{ url: string }>("/api/payments", {
        method: "POST",
        body: JSON.stringify({ invoiceId }),
      });
      return data.url;
    },
    onSuccess: async (url, invoiceId) => {
      await invalidateAfterInvoiceWrite(queryClient, { invoiceId });
      window.location.href = url;
    },
    onError: (error) => {
      handleApiError(error, "Payment failed");
    },
  });

  const createInvoiceMutation = useMutation({
    mutationFn: (body: {
      amount: number;
      currency?: string;
      description?: string;
      appointment_id?: string;
      due_date?: string;
      organization_id?: string;
    }) =>
      apiClient<{ invoice: Invoice }>("/api/invoices", {
        method: "POST",
        body: JSON.stringify(body),
      }),
    onSuccess: async (data, variables) => {
      const label =
        data.invoice.description?.trim() ||
        variables.description?.trim() ||
        "Invoice";
      const amountFormatted = formatInvoiceMoney({
        amount: variables.amount ?? data.invoice.amount / 100,
        currency: variables.currency ?? data.invoice.currency,
        unit: variables.amount != null ? "eur" : "cents",
      });
      notify.crud(invoiceCrudMessage("created", { label, amountFormatted }));
      await invalidateAfterInvoiceWrite(queryClient, {
        invoiceId: data.invoice.id,
        appointmentId: data.invoice.appointment_id ?? variables.appointment_id,
      });
    },
    onError: (error) => handleApiError(error, "Failed to create invoice"),
  });

  const updateInvoiceMutation = useMutation({
    mutationFn: ({
      invoiceId,
      body,
    }: {
      invoiceId: string;
      body: { status?: string; description?: string | null; due_date?: string | null };
    }) =>
      apiClient<{ invoice: Invoice }>(`/api/invoices/${invoiceId}`, {
        method: "PATCH",
        body: JSON.stringify(body),
      }),
    onSuccess: async (data) => {
      notify.crud(
        invoiceCrudMessage("updated", {
          label: data.invoice.description?.trim() || "Invoice",
        })
      );
      await invalidateAfterInvoiceWrite(queryClient, {
        invoiceId: data.invoice.id,
        appointmentId: data.invoice.appointment_id,
      });
    },
    onError: (error) => handleApiError(error, "Failed to update invoice"),
  });

  const recordPaymentMutation = useMutation({
    mutationFn: (invoiceId: string) =>
      apiClient<{ invoice: Invoice }>(`/api/invoices/${invoiceId}/record-payment`, {
        method: "POST",
        body: JSON.stringify({}),
      }),
    onSuccess: async (data) => {
      notify.crud(
        invoiceCrudMessage("updated", {
          label: data.invoice.description?.trim() || "Invoice",
          amountFormatted: formatInvoiceMoney({
            amount: data.invoice.amount,
            currency: data.invoice.currency,
            unit: "cents",
          }),
        })
      );
      await invalidateAfterInvoiceWrite(queryClient, {
        invoiceId: data.invoice.id,
        appointmentId: data.invoice.appointment_id,
      });
    },
    onError: (error) => handleApiError(error, "Failed to record payment"),
  });

  const refundInvoiceMutation = useMutation({
    mutationFn: (invoiceId: string) =>
      apiClient(`/api/invoices/${invoiceId}/refund`, {
        method: "POST",
        body: JSON.stringify({}),
      }),
    onSuccess: async (_, invoiceId) => {
      notify.crud(invoiceCrudMessage("updated", { label: "Invoice refunded" }));
      await invalidateAfterInvoiceWrite(queryClient, { invoiceId });
    },
    onError: (error) => handleApiError(error, "Refund failed"),
  });

  const deleteInvoiceMutation = useMutation({
    mutationFn: (invoiceId: string) =>
      apiClient(`/api/invoices/${invoiceId}`, { method: "DELETE" }),
    onMutate: async (invoiceId) => {
      const invoices =
        queryClient.getQueryData<Invoice[]>(queryKeys.invoices.all) ?? [];
      const deleted = invoices.find((inv) => inv.id === invoiceId) ?? null;
      return { deleted };
    },
    onSuccess: async (_, invoiceId, context) => {
      const deleted = context?.deleted;
      const label = deleted?.description?.trim() || "Invoice";
      const amountFormatted = deleted
        ? formatInvoiceMoney({
            amount: deleted.amount,
            currency: deleted.currency,
            unit: "cents",
          })
        : undefined;
      notify.crud(invoiceCrudMessage("deleted", { label, amountFormatted }));
      await invalidateAfterInvoiceWrite(queryClient, {
        invoiceId,
        appointmentId: deleted?.appointment_id,
      });
    },
    onError: (error) => handleApiError(error, "Failed to delete invoice"),
  });

  return {
    invoices: invoicesQuery.data || [],
    isLoading: invoicesQuery.isLoading,
    isError: invoicesQuery.isError,
    error: invoicesQuery.error,
    pay: payMutation.mutate,
    isPaying: payMutation.isPending,
    createInvoice: createInvoiceMutation.mutate,
    isCreating: createInvoiceMutation.isPending,
    updateInvoice: updateInvoiceMutation.mutate,
    isUpdating: updateInvoiceMutation.isPending,
    recordPayment: recordPaymentMutation.mutate,
    isRecording: recordPaymentMutation.isPending,
    refundInvoice: refundInvoiceMutation.mutate,
    isRefunding: refundInvoiceMutation.isPending,
    deleteInvoice: deleteInvoiceMutation.mutate,
    isDeleting: deleteInvoiceMutation.isPending,
  };
}
