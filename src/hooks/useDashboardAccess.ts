import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";

// DashboardAccessRow from the original API implementation
export interface DashboardAccessRow {
  owner_user_id: string;
}

interface DashboardAccessResponse {
  dashboardAccess: DashboardAccessRow[];
}

export function useDashboardAccess() {
  return useQuery({
    queryKey: queryKeys.dashboardAccess.all,
    queryFn: async () => {
      const response = await apiClient<DashboardAccessResponse>("/api/dashboard-access");
      return response.dashboardAccess || [];
    },
  });
}
