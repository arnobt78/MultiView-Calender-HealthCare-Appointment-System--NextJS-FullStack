import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { apiClient } from "@/lib/api-client";
import {
  coerceDashboardOverviewUpcomingAppointments,
  type DashboardOverviewQueueAppointment,
} from "@/lib/dashboard-overview-queue";

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
  /** Closest future non-done appointments (max 5), ascending by start. */
  upcomingAppointments: DashboardOverviewQueueAppointment[];
  recentAppointments: DashboardOverviewQueueAppointment[];
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
    queryFn: async () => {
      const raw = await apiClient<DashboardOverview & { nextAppointment?: DashboardOverviewQueueAppointment | null }>(
        "/api/dashboard/overview"
      );
      return coerceDashboardOverviewUpcomingAppointments(raw);
    },
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
