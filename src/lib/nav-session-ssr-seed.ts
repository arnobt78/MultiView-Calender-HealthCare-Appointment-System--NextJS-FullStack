/**
 * Synchronous TanStack seed for queryKeys.auth.me — root layout SSR before Navbar mounts.
 */

import type { QueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import type { UUID } from "@/types/types";

export type NavSsrUser = {
  id: UUID;
  email: string;
  role?: string;
  display_name?: string;
  email_verified: boolean;
  image?: string | null;
};

/** Seed only when cache has no data yet (safe under React strict double-render). */
export function seedAuthMeCacheFromSsr(
  queryClient: QueryClient,
  user: NavSsrUser | null | undefined
): void {
  if (user == null) return;
  const state = queryClient.getQueryState(queryKeys.auth.me);
  if (state?.data !== undefined) return;
  queryClient.setQueryData(queryKeys.auth.me, user);
}
