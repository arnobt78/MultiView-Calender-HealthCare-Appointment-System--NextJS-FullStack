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

export interface InvoicePayment {
  id: string;
  amount: number;
  status: string;
  created_at: string;
  stripe_payment_id?: string;
}

export interface Invoice {
  id: string;
  appointment_id?: string;
  user_id: string;
  amount: number;
  currency: string;
  status: string;
  description?: string;
  due_date?: string;
  paid_at?: string;
  created_at: string;
  payments: InvoicePayment[];
}

export function usePayments() {
  const queryClient = useQueryClient();

  const invoicesQuery = useQuery({
    queryKey: queryKeys.invoices.all,
    queryFn: async () => {
      const data = await apiClient<{ invoices: Invoice[] }>("/api/payments");
      return data.invoices || [];
    },
    // Invoice list is updated only via createInvoice / deleteInvoice mutations;
    // 30 s prevents redundant re-fetches on tab switches.
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
    onSuccess: async (url) => {
      // Invalidate invoices before redirect so the cache is stale when the user
      // returns from Stripe — ControlPanelPage will re-fetch automatically on mount.
      await invalidateInvoicesAndOverview(queryClient);
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
    }) =>
      apiClient<{ invoice: Invoice }>("/api/invoices", { method: "POST", body: JSON.stringify(body) }),
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
      const apt = data.invoice.appointment_id ?? variables.appointment_id;
      const patientId = apt ? getPatientIdFromAppointmentCache(queryClient, apt) : undefined;
      await invalidateInvoicesAndOverview(queryClient, { patientId });
    },
    onError: (error) => handleApiError(error, "Failed to create invoice"),
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
      notify.crud(
        invoiceCrudMessage("deleted", { label, amountFormatted })
      );
      const patientId = getPatientIdFromInvoiceCache(queryClient, invoiceId);
      await invalidateInvoicesAndOverview(queryClient, { patientId });
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
    deleteInvoice: deleteInvoiceMutation.mutate,
    isDeleting: deleteInvoiceMutation.isPending,
  };
}
