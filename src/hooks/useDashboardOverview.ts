import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { apiClient } from "@/lib/api-client";

export interface DashboardOverview {
  appointments: {
    total: number;
    today: number;
    thisWeek: number;
    thisMonth: number;
    done: number;
    pending: number;
    alert: number;
    overdue: number;
  };
  patients: { total: number; active: number };
  doctors: number;
  categories: number;
  nextAppointment: {
    id: string;
    title: string;
    start: string;
    end: string;
    location: string | null;
  } | null;
  recentAppointments: {
    id: string;
    title: string;
    start: string;
    end: string;
    status: string | null;
    patientName: string | null;
  }[];
  revenue: {
    paidCents: number;
    outstandingCents: number;
    totalInvoices: number;
    paidInvoices: number;
  };
}

export function useDashboardOverview() {
  const query = useQuery({
    queryKey: queryKeys.dashboard.overview,
    queryFn: () => apiClient<DashboardOverview>("/api/dashboard/overview"),
    staleTime: 60_000, // refresh every minute
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    dataUpdatedAt: query.dataUpdatedAt,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
