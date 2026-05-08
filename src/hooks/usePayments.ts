import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient, handleApiError } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";
import {
  getPatientIdFromAppointmentCache,
  getPatientIdFromInvoiceCache,
  invalidateInvoicesAndOverview,
} from "@/lib/query-client";
import { notify } from "@/lib/notify";

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
      notify.crud({ action: "created", entity: "Invoice", detail: "The invoice is ready for payment." });
      const apt = data.invoice.appointment_id ?? variables.appointment_id;
      const patientId = apt ? getPatientIdFromAppointmentCache(queryClient, apt) : undefined;
      await invalidateInvoicesAndOverview(queryClient, { patientId });
    },
    onError: (error) => handleApiError(error, "Failed to create invoice"),
  });

  const deleteInvoiceMutation = useMutation({
    mutationFn: (invoiceId: string) =>
      apiClient(`/api/invoices/${invoiceId}`, { method: "DELETE" }),
    onSuccess: async (_, invoiceId) => {
      notify.crud({ action: "deleted", entity: "Invoice", detail: "The invoice record was removed." });
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
