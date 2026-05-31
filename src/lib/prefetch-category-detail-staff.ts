import type { QueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";
import type { UsersListResponse } from "@/hooks/useUsers";
import {
  CATEGORY_DETAIL_ADMIN_USERS_FILTERS,
  CATEGORY_DETAIL_DOCTOR_USERS_FILTERS,
} from "@/lib/category-detail-ui-classes";

/** Warm doctor/admin lists for category detail appointment identity columns (hover + SSR parity). */
export async function prefetchCategoryDetailStaffUsers(
  queryClient: QueryClient
): Promise<void> {
  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: [...queryKeys.users.all, CATEGORY_DETAIL_DOCTOR_USERS_FILTERS],
      queryFn: () =>
        apiClient<UsersListResponse>(
          `/api/users?role=doctor&limit=${CATEGORY_DETAIL_DOCTOR_USERS_FILTERS.limit}`
        ),
    }),
    queryClient.prefetchQuery({
      queryKey: [...queryKeys.users.all, CATEGORY_DETAIL_ADMIN_USERS_FILTERS],
      queryFn: () =>
        apiClient<UsersListResponse>(
          `/api/users?role=admin&limit=${CATEGORY_DETAIL_ADMIN_USERS_FILTERS.limit}`
        ),
    }),
  ]);
}
