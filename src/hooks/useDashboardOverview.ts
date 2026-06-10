import { useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { apiClient } from "@/lib/api-client";
import {
  coerceDashboardOverviewPayload,
  type DashboardOverviewQueueAppointment,
  type DashboardOverviewRecentQueueAppointment,
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
    cancelled: number;
    overdue: number;
  };
  patients: { total: number; active: number };
  doctors: number;
  categories: number;
  /** Closest future non-done appointments (max 5), ascending by start. */
  upcomingAppointments: DashboardOverviewQueueAppointment[];
  recentAppointments: DashboardOverviewRecentQueueAppointment[];
  revenue: {
    paidCents: number;
    outstandingCents: number;
    totalInvoices: number;
    paidInvoices: number;
  };
}

export function useDashboardOverview() {
  const queryClient = useQueryClient();
  const overviewInitialData = queryClient.getQueryData<DashboardOverview>(
    queryKeys.dashboard.overview
  );

  const query = useQuery({
    queryKey: queryKeys.dashboard.overview,
    queryFn: async () => {
      const raw = await apiClient<
        DashboardOverview & { nextAppointment?: DashboardOverviewQueueAppointment | null }
      >("/api/dashboard/overview");
      return coerceDashboardOverviewPayload(raw);
    },
    initialData: overviewInitialData,
    refetchOnMount: true,
    staleTime: 60_000,
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isRefetching: query.isRefetching,
    dataUpdatedAt: query.dataUpdatedAt,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
