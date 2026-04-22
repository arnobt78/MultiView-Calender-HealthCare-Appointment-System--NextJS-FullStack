import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient, handleApiError } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";
import { User, UUID } from "@/types/types";
import { toast } from "sonner";

interface AuthResponse {
  user: {
    id: UUID;
    email: string;
    role?: string;
    display_name?: string;
    email_verified: boolean;
    image?: string | null;
  } | null;
}

export function useAuth() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: queryKeys.auth.me,
    queryFn: async () => {
      try {
        const response = await apiClient<AuthResponse>("/api/auth/me");
        return response.user;
      } catch (error) {
        // me endpoint returns 401 when not logged in, which is expected
        return null;
      }
    },
    // Don't retry auth checks
    retry: false,
    // Keep auth state fresh for 5 minutes
    staleTime: 5 * 60 * 1000,
  });

  const logoutMutation = useMutation({
    mutationFn: () => apiClient("/api/auth/logout", { method: "POST" }),
    onSuccess: () => {
      toast.success("You have been logged out successfully");
      // Navigate first — full reload clears all client state cleanly
      window.location.href = "/login";
    },
    onError: () => {
      // Even on API error, session cookie is cleared server-side; navigate away
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
