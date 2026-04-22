import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient, handleApiError } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";
import { invalidateAllForCrud } from "@/lib/query-client";
import type { User } from "@/types/types";
import { toast } from "sonner";

export type UserListFilters = {
  role?: string;
  limit?: number;
  offset?: number;
};

export interface UsersListResponse {
  users: User[];
  pagination: { limit: number; offset: number; total: number; count: number };
}

export type UserUpdateInput = {
  role?: string;
  display_name?: string;
  image?: string;
};

export function useUsers(filters: UserListFilters = {}) {
  const queryClient = useQueryClient();
  const params = new URLSearchParams();
  if (filters.role) params.set("role", filters.role);
  if (filters.limit != null) params.set("limit", String(filters.limit));
  if (filters.offset != null) params.set("offset", String(filters.offset));
  const queryString = params.toString();

  const query = useQuery({
    queryKey: [...queryKeys.users.all, filters],
    queryFn: async () => {
      const res = await apiClient<UsersListResponse>(
        `/api/users${queryString ? `?${queryString}` : ""}`
      );
      return res;
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, ...data }: UserUpdateInput & { id: string }) =>
      apiClient<{ user: User }>(`/api/users/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
    onSuccess: async (data) => {
      await invalidateAllForCrud(queryClient);
      toast.success(`User '${data.user.display_name ?? data.user.email}' updated`);
    },
    onError: (e) => handleApiError(e, "Failed to update user"),
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    updateUser: updateMutation.mutate,
    updateUserAsync: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
  };
}

export function useUser(id: string | null) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: queryKeys.users.detail(id ?? ""),
    queryFn: async () => {
      const res = await apiClient<{ user: User }>(`/api/users/${id}`);
      return res.user;
    },
    enabled: !!id,
  });

  const updateMutation = useMutation({
    mutationFn: (data: UserUpdateInput) =>
      apiClient<{ user: User }>(`/api/users/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
    onSuccess: async (data) => {
      await invalidateAllForCrud(queryClient);
      toast.success(`User '${data.user.display_name ?? data.user.email}' updated`);
    },
    onError: (e) => handleApiError(e, "Failed to update user"),
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    updateUser: updateMutation.mutate,
    updateUserAsync: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
  };
}
