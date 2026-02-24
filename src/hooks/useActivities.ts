import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";
import { Activity } from "@/types/types";

interface ActivitiesResponse {
  activities: Activity[];
}

export function useActivities(appointmentId: string | null) {
  return useQuery({
    queryKey: queryKeys.activities.byAppointment(appointmentId ?? ""),
    queryFn: async () => {
      if (!appointmentId) return [];
      const res = await apiClient<ActivitiesResponse>(
        `/api/appointments/${appointmentId}/activities`
      );
      return res.activities || [];
    },
    enabled: !!appointmentId,
    staleTime: 60 * 1000,
  });
}
