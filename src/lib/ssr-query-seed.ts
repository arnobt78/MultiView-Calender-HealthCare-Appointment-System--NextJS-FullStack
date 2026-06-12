import type { QueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import type { UserListFilters, UsersListResponse } from "@/hooks/useUsers";

/** Seed GET /api/invoices list cache — query key must match `usePayments` / `useInvoice`. */
export function seedInvoicesListCache(
  queryClient: QueryClient,
  invoices: import("@/hooks/usePayments").Invoice[]
): void {
  queryClient.setQueryData(queryKeys.invoices.all, invoices);
}

/** Seed GET /api/users list cache — query key must match `useUsers(filters)`. */
export function seedUsersListCache(
  queryClient: QueryClient,
  filters: UserListFilters,
  data: UsersListResponse
): void {
  queryClient.setQueryData([...queryKeys.users.all, filters], data);
}
