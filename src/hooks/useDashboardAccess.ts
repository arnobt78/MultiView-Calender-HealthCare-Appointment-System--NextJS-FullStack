import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";

// DashboardAccessRow from the original API implementation
export interface DashboardAccessRow {
  owner_user_id: string;
}

interface DashboardAccessResponse {
  dashboard_access: DashboardAccessRow[];
}

export function useDashboardAccess() {
  return useQuery({
    queryKey: queryKeys.dashboardAccess.all,
    queryFn: async () => {
      const response = await apiClient<DashboardAccessResponse>("/api/dashboard-access");
      return response.dashboard_access || [];
    },
    staleTime: 5 * 60 * 1000,
  });
}
