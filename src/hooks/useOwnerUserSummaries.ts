import { useMemo } from "react";
import { useQueries } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";

export type OwnerUserSummary = { id: string; email: string };

/**
 * Resolves owner emails for appointment user_id values via cached user search queries.
 */
export function useOwnerUserSummaries(
  userIds: (string | undefined | null)[],
  currentUser?: { id?: string | null; email?: string | null } | null
) {
  const ids = useMemo(
    () => [...new Set(userIds.filter((id): id is string => Boolean(id)))],
    [userIds]
  );

  const currentSummary = useMemo<OwnerUserSummary | null>(() => {
    if (!currentUser?.id || !currentUser?.email) return null;
    return { id: currentUser.id, email: currentUser.email };
  }, [currentUser]);

  const queries = useQueries({
    queries: ids.map((id) => ({
      queryKey: queryKeys.users.search(id),
      queryFn: async (): Promise<OwnerUserSummary | null> => {
        const res = await apiClient<{ users: { id: string; email: string }[] }>(
          `/api/users/search?query=${encodeURIComponent(id)}`
        );
        const user = res.users?.find((u) => u.id === id);
        return user ? { id: user.id, email: user.email } : null;
      },
      enabled: ids.length > 0 && id !== currentSummary?.id,
      staleTime: 5 * 60 * 1000,
    })),
  });

  return useMemo(() => {
    const out: OwnerUserSummary[] = [];
    if (currentSummary) out.push(currentSummary);
    for (const q of queries) {
      if (q.data) out.push(q.data);
    }
    return out;
  }, [queries, currentSummary]);
}
