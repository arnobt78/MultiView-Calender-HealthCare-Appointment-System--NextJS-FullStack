import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";

interface InsightsData {
  overview: {
    total: number;
    done: number;
    pending: number;
    upcoming: number;
    overdue: number;
    thisMonth: number;
  };
  byStatus: Record<string, number>;
  byCategory: Record<string, number>;
  monthlyData: { month: string; count: number }[];
  topPatients: { name: string; count: number }[];
}

export function useInsights() {
  return useQuery({
    queryKey: queryKeys.insights.all,
    queryFn: () => apiClient<InsightsData>("/api/insights"),
    staleTime: 5 * 60_000,
  });
}
