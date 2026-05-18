import { useMemo } from "react";
import { useQueries } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";
import { useAuth } from "@/hooks/useAuth";
import { useInitialNavRole } from "@/context/NavRoleContext";
import { isPatientRole } from "@/lib/rbac";

export type OwnerUserSummary = { id: string; email: string; display_name?: string | null };

/**
 * Resolves owner emails for appointment `user_id` via `/api/users/search` (staff only).
 * Patients: no user-directory API — returns current user only; "Assigned by" may show owner id.
 */
export function useOwnerUserSummaries(
  userIds: (string | undefined | null)[],
  currentUser?: { id?: string | null; email?: string | null; display_name?: string | null } | null
) {
  const { user: authUser } = useAuth();
  const initialNavRole = useInitialNavRole();
  const role = authUser?.role ?? initialNavRole;
  const canResolveOwnerDirectory = !isPatientRole(role);

  const ids = useMemo(
    () => [...new Set(userIds.filter((id): id is string => Boolean(id)))],
    [userIds]
  );

  const currentSummary = useMemo<OwnerUserSummary | null>(() => {
    if (!currentUser?.id || !currentUser?.email) return null;
    return { id: currentUser.id, email: currentUser.email, display_name: currentUser.display_name ?? null };
  }, [currentUser]);

  const queries = useQueries({
    queries: ids.map((id) => ({
      queryKey: queryKeys.users.search(id),
      queryFn: async (): Promise<OwnerUserSummary | null> => {
        const res = await apiClient<{ users: { id: string; email: string; display_name?: string | null }[] }>(
          `/api/users/search?query=${encodeURIComponent(id)}`
        );
        const user = res.users?.find((u) => u.id === id);
        return user ? { id: user.id, email: user.email, display_name: user.display_name ?? null } : null;
      },
      enabled:
        canResolveOwnerDirectory &&
        ids.length > 0 &&
        id !== currentSummary?.id,
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
