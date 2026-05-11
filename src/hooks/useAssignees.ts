import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { fetchAssignees } from "@/lib/query-fetchers";
import type { AppointmentAssignee } from "@/types/types";

export function useAssignees() {
  const query = useQuery({
    queryKey: queryKeys.assignees.all,
    queryFn: () => fetchAssignees(),
    // Assignee list is invalidated on every appointment mutation; 30 s window prevents
    // redundant refetches on rapid re-mounts (e.g. tab switches).
    staleTime: 30_000,
  });

  return {
    assignees: query.data ?? ([] as AppointmentAssignee[]),
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
