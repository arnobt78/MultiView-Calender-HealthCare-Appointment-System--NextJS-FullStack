import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";
import type { User } from "@/types/types";

export type UserListFilters = {
  role?: string;
  limit?: number;
  offset?: number;
};

export interface UsersListResponse {
  users: User[];
  pagination: { limit: number; offset: number; total: number; count: number };
}

export function useUsers(filters: UserListFilters = {}) {
  const params = new URLSearchParams();
  if (filters.role) params.set("role", filters.role);
  if (filters.limit != null) params.set("limit", String(filters.limit));
  if (filters.offset != null) params.set("offset", String(filters.offset));
  const queryString = params.toString();

  return useQuery({
    queryKey: [...queryKeys.users.all, filters],
    queryFn: async () => {
      const res = await apiClient<UsersListResponse>(
        `/api/users${queryString ? `?${queryString}` : ""}`
      );
      return res;
    },
  });
}

export function useUser(id: string | null) {
  return useQuery({
    queryKey: queryKeys.users.detail(id ?? ""),
    queryFn: async () => {
      const res = await apiClient<{ user: User }>(`/api/users/${id}`);
      return res.user;
    },
    enabled: !!id,
  });
}
