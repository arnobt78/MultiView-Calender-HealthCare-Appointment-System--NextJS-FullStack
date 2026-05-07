import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";
import type { UUID } from "@/types/types";

/** Shape stored at queryKeys.auth.me — mirrors /api/auth/me response.user. */
type MeUser = {
  id: UUID;
  email: string;
  role?: string;
  display_name?: string;
  email_verified: boolean;
  image?: string | null;
} | null;

interface AuthResponse {
  user: MeUser;
}

export function useAuth() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: queryKeys.auth.me,
    queryFn: async () => {
      try {
        const response = await apiClient<AuthResponse>("/api/auth/me");
        return response.user;
      } catch {
        // /api/auth/me returns 401 when not authenticated — treat as guest.
        return null;
      }
    },
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  /** Reads the cached me-user safely with the typed cache shape. */
  function getCachedName(): string {
    const me = queryClient.getQueryData<MeUser>(queryKeys.auth.me);
    return me?.display_name ?? me?.email?.split("@")[0] ?? "there";
  }

  const logoutMutation = useMutation({
    mutationFn: () => apiClient("/api/auth/logout", { method: "POST" }),
    onSuccess: () => {
      const payload = JSON.stringify({ name: getCachedName(), timestamp: Date.now() });
      sessionStorage.setItem("post-logout-toast", payload);
      localStorage.setItem("post-logout-toast", payload);
      // Full reload clears all client-side React Query / store state cleanly.
      window.location.href = "/login";
    },
    onError: () => {
      const payload = JSON.stringify({ name: getCachedName(), timestamp: Date.now() });
      sessionStorage.setItem("post-logout-toast", payload);
      localStorage.setItem("post-logout-toast", payload);
      // Session cookie is already cleared server-side even on API error; navigate away.
      window.location.href = "/login";
    },
  });

  return {
    user: query.data,
    isLoading: query.isLoading,
    isAuthenticated: !!query.data,
    refetch: query.refetch,
    logout: logoutMutation.mutate,
    isLoggingOut: logoutMutation.isPending,
  };
}
