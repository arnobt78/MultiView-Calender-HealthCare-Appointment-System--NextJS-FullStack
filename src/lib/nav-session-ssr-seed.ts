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
  const existing = queryClient.getQueryData<NavSsrUser | null>(queryKeys.auth.me);
  /* Soft-nav after login can leave stale `null` guest cache — SSR session must win. */
  if (existing != null && typeof existing === "object" && "id" in existing) return;
  queryClient.setQueryData(queryKeys.auth.me, user);
}

/** Seed auth.me from POST /api/auth/login response before soft navigation. */
export function seedAuthMeFromLoginResponse(
  queryClient: QueryClient,
  user: {
    id: UUID;
    email: string;
    role?: string;
    display_name?: string;
    image?: string | null;
  }
): void {
  queryClient.setQueryData(queryKeys.auth.me, {
    ...user,
    email_verified: true,
  });
}
