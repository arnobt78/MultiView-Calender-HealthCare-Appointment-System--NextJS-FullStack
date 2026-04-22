import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient, handleApiError } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";
import { invalidateAllForCrud } from "@/lib/query-client";
import { toast } from "sonner";

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
    onSuccess: (url) => {
      window.location.href = url;
    },
    onError: (error) => {
      handleApiError(error, "Payment failed");
    },
  });

  const createInvoiceMutation = useMutation({
    mutationFn: (body: { amount: number; currency?: string; description?: string; appointment_id?: string; due_date?: string }) =>
      apiClient("/api/invoices", { method: "POST", body: JSON.stringify(body) }),
    onSuccess: () => {
      toast.success("Invoice created");
      invalidateAllForCrud(queryClient);
    },
    onError: (error) => handleApiError(error, "Failed to create invoice"),
  });

  const deleteInvoiceMutation = useMutation({
    mutationFn: (invoiceId: string) =>
      apiClient(`/api/invoices/${invoiceId}`, { method: "DELETE" }),
    onSuccess: () => {
      toast.success("Invoice deleted");
      invalidateAllForCrud(queryClient);
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
