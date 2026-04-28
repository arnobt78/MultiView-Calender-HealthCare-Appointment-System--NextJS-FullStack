import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { fetchAssignees } from "@/lib/query-fetchers";
import type { AppointmentAssignee } from "@/types/types";

export function useAssignees() {
  const query = useQuery({
    queryKey: queryKeys.assignees.all,
    queryFn: () => fetchAssignees(),
  });

  return {
    assignees: query.data ?? ([] as AppointmentAssignee[]),
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
