import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient, handleApiError } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";
import {
  getPatientIdFromAppointmentCache,
  getPatientIdFromInvoiceCache,
  getOrganizationIdFromInvoiceCache,
  invalidateInvoicesAndOverview,
  invalidateInvoicesBilling,
  invalidateNotificationsAndCrossTab,
} from "@/lib/query-client";
import { mapApiInvoiceToRow, mergeInvoiceIntoScopedListCaches, removeInvoiceFromScopedListCaches } from "@/lib/billing-invoice-map";
import { notify } from "@/lib/notify";
import {
  formatInvoiceMoney,
  invoiceCrudMessage,
} from "@/lib/crud-notify-messages";
import type { InvoiceRow, InvoicePaymentRow } from "@/lib/billing-types";
import {
  fetchInvoicesListClient,
  INVOICES_LIST_STALE_MS,
} from "@/lib/invoices-list-client";

export type InvoicePayment = InvoicePaymentRow;
export type Invoice = InvoiceRow;

async function invalidateAfterInvoiceWrite(
  queryClient: ReturnType<typeof useQueryClient>,
  opts?: {
    invoiceId?: string;
    appointmentId?: string | null;
    organizationId?: string | null;
    /** Full bust (pay/refund/delete) vs lighter draft create/PATCH */
    scope?: "billing" | "full";
  }
) {
  const patientId = opts?.appointmentId
    ? getPatientIdFromAppointmentCache(queryClient, opts.appointmentId)
    : opts?.invoiceId
      ? getPatientIdFromInvoiceCache(queryClient, opts.invoiceId)
      : undefined;
  const organizationId =
    opts?.organizationId ??
    (opts?.invoiceId
      ? getOrganizationIdFromInvoiceCache(queryClient, opts.invoiceId)
      : undefined);
  const invalidationOpts = {
    patientId: patientId ?? undefined,
    invoiceId: opts?.invoiceId ?? undefined,
    organizationId: organizationId ?? undefined,
  };
  if (opts?.scope === "billing") {
    await invalidateInvoicesBilling(queryClient, invalidationOpts);
    return;
  }
  await invalidateInvoicesAndOverview(queryClient, invalidationOpts);
}

export type UsePaymentsOptions = {
  /** SSR seed — avoids duplicate fetch on first paint when layout already hydrated cache. */
  invoicesInitialData?: Invoice[];
};

export function usePayments(options?: UsePaymentsOptions) {
  const queryClient = useQueryClient();

  /** SSR prop, sync parent seed, or hydrated cache — first paint without extra GET. */
  const invoicesInitialData =
    options?.invoicesInitialData ??
    queryClient.getQueryData<Invoice[]>(queryKeys.invoices.all);

  const invoicesQuery = useQuery({
    queryKey: queryKeys.invoices.all,
    queryFn: () => fetchInvoicesListClient(),
    initialData: invoicesInitialData,
    staleTime: INVOICES_LIST_STALE_MS,
    // SSR/cache hit — skip mount refetch; invalidateAfterInvoiceWrite still busts list everywhere.
    refetchOnMount: invoicesInitialData !== undefined ? false : true,
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
      // Stripe redirect — no list merge; user leaves page; return URL triggers invalidate.
      await invalidateAfterInvoiceWrite(queryClient, { invoiceId });
      // Always navigate to fresh Checkout URL (server expired prior open session).
      window.location.assign(url);
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
      appointment_id: string;
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
      mergeInvoiceIntoScopedListCaches(queryClient, mapApiInvoiceToRow(data.invoice));
      await invalidateAfterInvoiceWrite(queryClient, {
        invoiceId: data.invoice.id,
        appointmentId: data.invoice.appointment_id ?? variables.appointment_id,
        organizationId: data.invoice.organization_id ?? variables.organization_id,
        scope: "billing",
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
      mergeInvoiceIntoScopedListCaches(queryClient, mapApiInvoiceToRow(data.invoice));
      await invalidateAfterInvoiceWrite(queryClient, {
        invoiceId: data.invoice.id,
        appointmentId: data.invoice.appointment_id,
        organizationId: data.invoice.organization_id,
        scope: data.invoice.status === "paid" ? "full" : "billing",
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
      mergeInvoiceIntoScopedListCaches(queryClient, mapApiInvoiceToRow(data.invoice));
      await invalidateAfterInvoiceWrite(queryClient, {
        invoiceId: data.invoice.id,
        appointmentId: data.invoice.appointment_id,
        organizationId: data.invoice.organization_id,
      });
    },
    onError: (error) => handleApiError(error, "Failed to record payment"),
  });

  const refundInvoiceMutation = useMutation({
    mutationFn: (invoiceId: string) =>
      apiClient<{ invoice: Invoice }>(`/api/invoices/${invoiceId}/refund`, {
        method: "POST",
        body: JSON.stringify({}),
      }),
    onSuccess: async (data) => {
      notify.crud(invoiceCrudMessage("updated", { label: "Invoice refunded" }));
      mergeInvoiceIntoScopedListCaches(queryClient, mapApiInvoiceToRow(data.invoice));
      await invalidateAfterInvoiceWrite(queryClient, {
        invoiceId: data.invoice.id,
        appointmentId: data.invoice.appointment_id,
        organizationId: data.invoice.organization_id,
      });
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
      if (deleted) {
        removeInvoiceFromScopedListCaches(queryClient, deleted);
      }
      await invalidateAfterInvoiceWrite(queryClient, {
        invoiceId,
        appointmentId: deleted?.appointment_id,
        organizationId: deleted?.organization_id,
      });
      await invalidateNotificationsAndCrossTab(queryClient);
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
