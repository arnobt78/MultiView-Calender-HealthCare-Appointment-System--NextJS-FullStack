import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient, handleApiError } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";
import {
  invalidateDoctorDetailAndSnapshot,
  invalidateUsersAndAuth,
  invalidateDashboardOverview,
} from "@/lib/query-client";
import type { User } from "@/types/types";
import { notify } from "@/lib/notify";

export type UserListFilters = {
  role?: string;
  /** Passed as roles=a,b on GET /api/users */
  roles?: string[];
  limit?: number;
  offset?: number;
};

export interface UsersListResponse {
  users: User[];
  pagination: { limit: number; offset: number; total: number; count: number };
}

export type UserUpdateInput = {
  role?: string | null;
  display_name?: string | null;
  image?: string | null;
  specialty?: string | null;
  bio?: string | null;
  phone?: string | null;
  license_number?: string | null;
  department?: string | null;
  consultation_fee?: number | null;
  office_location?: string | null;
  languages_spoken?: string[];
  years_of_experience?: number | null;
  is_active?: boolean;
};

export function useUsers(
  filters: UserListFilters = {},
  options?: { enabled?: boolean; initialData?: UsersListResponse }
) {
  const queryClient = useQueryClient();
  const params = new URLSearchParams();
  if (filters.role) params.set("role", filters.role);
  if (filters.roles?.length) params.set("roles", filters.roles.join(","));
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
    staleTime: 5 * 60 * 1000,
    initialData: options?.initialData,
    enabled: options?.enabled !== false,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, ...data }: UserUpdateInput & { id: string }) =>
      apiClient<{ user: User }>(`/api/users/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
    onSuccess: async (data) => {
      await invalidateUsersAndAuth(queryClient);
      await invalidateDoctorDetailAndSnapshot(queryClient, data.user.id);
      // Role changes affect the "Doctors" and other aggregate counts in dashboard overview.
      await invalidateDashboardOverview(queryClient);
      notify.crud({ action: "updated", entity: "User", detail: `${data.user.display_name ?? data.user.email} was updated.` });
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
    staleTime: 5 * 60 * 1000,
  });

  const updateMutation = useMutation({
    mutationFn: (data: UserUpdateInput) => {
      // Guard against null id so the request never hits /api/users/null.
      if (!id) throw new Error("User id is required for update");
      return apiClient<{ user: User }>(`/api/users/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      });
    },
    onSuccess: async (data) => {
      await invalidateUsersAndAuth(queryClient);
      if (id) await invalidateDoctorDetailAndSnapshot(queryClient, id);
      // Role changes affect dashboard overview aggregate counts (e.g. total doctors).
      void invalidateDashboardOverview(queryClient);
      notify.crud({ action: "updated", entity: "User", detail: `${data.user.display_name ?? data.user.email} was updated.` });
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
