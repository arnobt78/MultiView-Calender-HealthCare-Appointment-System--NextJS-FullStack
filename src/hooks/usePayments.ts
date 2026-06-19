import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import type { QueryClient } from "@tanstack/react-query";
import { apiClient, handleApiError } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";
import {
  getPatientIdFromAppointmentCache,
  getPatientIdFromInvoiceCache,
  getDoctorIdsFromInvoiceCache,
  getOrganizationIdFromInvoiceCache,
  syncInvoicesAfterWrite,
  invalidateNotificationsAndCrossTab,
} from "@/lib/query-client";
import {
  mapApiInvoiceToRow,
  mergeInvoiceIntoAllCaches,
  removeInvoiceFromScopedListCaches,
  resolvePatientIdFromInvoiceRow,
} from "@/lib/billing-invoice-map";
import {
  publishInvoiceMergeCrossTab,
  publishInvoiceRemoveCrossTab,
} from "@/lib/query-cache-cross-tab";
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
import { EMPTY_INVOICES } from "@/lib/stable-query-fallbacks";

export type RefundInvoiceInput =
  | string
  | { invoiceId: string; suppressSuccessNotify?: boolean };

export type InvoicePayment = InvoicePaymentRow;
export type Invoice = InvoiceRow;

function resolveRefundInvoiceId(input: RefundInvoiceInput): string {
  return typeof input === "string" ? input : input.invoiceId;
}


function resolveInvoicePatientId(
  queryClient: QueryClient,
  row: InvoiceRow,
  appointmentId?: string | null,
  previousRow?: InvoiceRow | null
): string | undefined {
  return (
    resolvePatientIdFromInvoiceRow(row) ??
    (appointmentId ? getPatientIdFromAppointmentCache(queryClient, appointmentId) : undefined) ??
    (previousRow ? resolvePatientIdFromInvoiceRow(previousRow) : undefined)
  );
}

/** Cache-first path — merge locally, selective background sync, cross-tab row broadcast. */
async function syncAfterInvoiceWrite(
  queryClient: QueryClient,
  row: InvoiceRow,
  opts: {
    scope: "billing" | "full";
    previousRow?: InvoiceRow | null;
    deleted?: boolean;
    appointmentId?: string | null;
    organizationId?: string | null;
  }
): Promise<void> {
  const previous = opts.previousRow ?? null;
  const totalsChanged =
    Boolean(opts.deleted) ||
    !previous ||
    previous.amount !== row.amount ||
    previous.status !== row.status;

  const patientId = resolveInvoicePatientId(
    queryClient,
    row,
    opts.appointmentId ?? row.appointment_id,
    previous
  );
  const organizationId =
    opts.organizationId ?? row.organization_id ?? previous?.organization_id ?? undefined;

  if (opts.deleted && previous) {
    removeInvoiceFromScopedListCaches(queryClient, previous);
    await syncInvoicesAfterWrite(queryClient, {
      invoiceId: row.id,
      patientId,
      organizationId,
      scope: opts.scope,
      totalsChanged: true,
      status: previous.status,
      cachesMerged: true,
      deleted: true,
    });
    publishInvoiceRemoveCrossTab(row.id, { scope: opts.scope, patientId });
    return;
  }

  mergeInvoiceIntoAllCaches(queryClient, row);
  const doctorIds = getDoctorIdsFromInvoiceCache(queryClient, row.id);

  await syncInvoicesAfterWrite(queryClient, {
    invoiceId: row.id,
    patientId,
    organizationId,
    doctorIds,
    scope: opts.scope,
    totalsChanged,
    status: row.status,
    cachesMerged: true,
  });
  publishInvoiceMergeCrossTab(row, { scope: opts.scope, patientId });
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
    onSuccess: (url, invoiceId) => {
      // Redirect immediately — user leaves the app; Stripe return invalidates via ?status= on portal.
      void syncInvoicesAfterWrite(queryClient, {
        invoiceId,
        patientId: getPatientIdFromInvoiceCache(queryClient, invoiceId),
        organizationId: getOrganizationIdFromInvoiceCache(queryClient, invoiceId),
        doctorIds: getDoctorIdsFromInvoiceCache(queryClient, invoiceId),
        scope: "full",
        totalsChanged: true,
        cachesMerged: false,
      });
      window.location.assign(url);
    },
    onError: (error) => {
      handleApiError(error, "Payment failed");
    },
  });

  const resetPayMutation = payMutation.reset;

  // BFCache: browser back from Stripe can restore the page with payMutation still pending.
  useEffect(() => {
    const onPageShow = (event: PageTransitionEvent) => {
      if (event.persisted) {
        resetPayMutation();
      }
    };
    window.addEventListener("pageshow", onPageShow);
    return () => window.removeEventListener("pageshow", onPageShow);
  }, [resetPayMutation]);

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
      const row = mapApiInvoiceToRow(data.invoice);
      await syncAfterInvoiceWrite(queryClient, row, {
        scope: "billing",
        appointmentId: data.invoice.appointment_id ?? variables.appointment_id,
        organizationId: data.invoice.organization_id ?? variables.organization_id,
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
      const row = mapApiInvoiceToRow(data.invoice);
      const previous =
        queryClient.getQueryData<Invoice[]>(queryKeys.invoices.all)?.find((i) => i.id === row.id) ??
        queryClient.getQueryData<Invoice>(queryKeys.invoices.detail(row.id)) ??
        null;
      await syncAfterInvoiceWrite(queryClient, row, {
        scope: data.invoice.status === "paid" ? "full" : "billing",
        previousRow: previous,
        appointmentId: data.invoice.appointment_id,
        organizationId: data.invoice.organization_id,
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
      const row = mapApiInvoiceToRow(data.invoice);
      const previous =
        queryClient.getQueryData<Invoice[]>(queryKeys.invoices.all)?.find((i) => i.id === row.id) ??
        null;
      await syncAfterInvoiceWrite(queryClient, row, {
        scope: "full",
        previousRow: previous,
        appointmentId: data.invoice.appointment_id,
        organizationId: data.invoice.organization_id,
      });
    },
    onError: (error) => handleApiError(error, "Failed to record payment"),
  });

  const refundInvoiceMutation = useMutation({
    mutationFn: (input: RefundInvoiceInput) => {
      const invoiceId = resolveRefundInvoiceId(input);
      return apiClient<{ invoice: Invoice }>(`/api/invoices/${invoiceId}/refund`, {
        method: "POST",
        body: JSON.stringify({}),
      });
    },
    onSuccess: async (data, input) => {
      const suppress =
        typeof input === "object" && Boolean(input.suppressSuccessNotify);
      if (!suppress) {
        notify.crud(invoiceCrudMessage("updated", { label: "Invoice refunded" }));
      }
      const row = mapApiInvoiceToRow(data.invoice);
      const previous =
        queryClient.getQueryData<Invoice[]>(queryKeys.invoices.all)?.find((i) => i.id === row.id) ??
        null;
      await syncAfterInvoiceWrite(queryClient, row, {
        scope: "full",
        previousRow: previous,
        appointmentId: data.invoice.appointment_id,
        organizationId: data.invoice.organization_id,
      });
    },
    onError: (error) => handleApiError(error, "Refund failed"),
  });

  const deleteInvoiceMutation = useMutation({
    mutationFn: async (invoiceId: string) => {
      const data = await apiClient<{ invoice: Parameters<typeof mapApiInvoiceToRow>[0] }>(
        `/api/invoices/${invoiceId}`,
        { method: "DELETE" }
      );
      return mapApiInvoiceToRow(data.invoice);
    },
    onMutate: async (invoiceId) => {
      const invoices =
        queryClient.getQueryData<Invoice[]>(queryKeys.invoices.all) ?? EMPTY_INVOICES;
      const previousRow = invoices.find((inv) => inv.id === invoiceId) ?? null;
      return { previousRow };
    },
    onSuccess: async (row, _invoiceId, context) => {
      const previousRow = context?.previousRow;
      const label = previousRow?.description?.trim() || row.description?.trim() || "Invoice";
      const amountFormatted = formatInvoiceMoney({
        amount: row.amount,
        currency: row.currency,
        unit: "cents",
      });
      notify.crud(invoiceCrudMessage("deleted", { label, amountFormatted }));
      await syncAfterInvoiceWrite(queryClient, row, {
        scope: "full",
        previousRow,
        appointmentId: row.appointment_id,
        organizationId: row.organization_id,
      });
      await invalidateNotificationsAndCrossTab(queryClient);
    },
    onError: (error) => handleApiError(error, "Failed to delete invoice"),
  });

  return {
    invoices: invoicesQuery.data ?? EMPTY_INVOICES,
    isLoading: invoicesQuery.isLoading,
    isError: invoicesQuery.isError,
    error: invoicesQuery.error,
    pay: payMutation.mutate,
    isPaying: payMutation.isPending,
    /** Per-invoice Pay Now — use on list surfaces (patient portal sidebar). */
    payingInvoiceId: payMutation.isPending ? (payMutation.variables ?? null) : null,
    createInvoice: createInvoiceMutation.mutate,
    isCreating: createInvoiceMutation.isPending,
    updateInvoice: updateInvoiceMutation.mutate,
    isUpdating: updateInvoiceMutation.isPending,
    recordPayment: recordPaymentMutation.mutate,
    isRecording: recordPaymentMutation.isPending,
    refundInvoice: refundInvoiceMutation.mutate,
    refundInvoiceAsync: refundInvoiceMutation.mutateAsync,
    isRefunding: refundInvoiceMutation.isPending,
    deleteInvoice: deleteInvoiceMutation.mutate,
    deleteInvoiceAsync: deleteInvoiceMutation.mutateAsync,
    isDeleting: deleteInvoiceMutation.isPending,
  };
}
