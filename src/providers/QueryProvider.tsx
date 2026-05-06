"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";
import { useState } from "react";
import { createQueryClient } from "@/lib/query-client";

/**
 * QueryProvider
 *
 * Wraps the app in TanStack Query context with localStorage persistence.
 *
 * Persistence strategy:
 * - Uses `PersistQueryClientProvider` + `createAsyncStoragePersister` to save the
 *   entire query cache to `localStorage` under the key `cal-appt-query-cache`.
 * - On hard refresh / next visit, cached data is restored from localStorage before
 *   network calls fire. React Query then background-refetches stale entries per
 *   the `staleTime: 3min` set in createQueryClient().
 * - This eliminates the full skeleton flash on page reload because data arrives
 *   from localStorage rather than waiting for API responses.
 *
 * Async persister (not deprecated):
 * - Uses `createAsyncStoragePersister` from `@tanstack/query-async-storage-persister`
 *   (replaces the deprecated `createSyncStoragePersister`). The async variant is
 *   non-blocking and is the current recommended approach by TanStack.
 *
 * Graceful degradation:
 * - `getPersister()` returns `null` when `localStorage` is unavailable (SSR,
 *   private-browsing edge cases). Falls back to the plain `QueryClientProvider`
 *   so the app works normally — just without persistence.
 *
 * Cache key:  `cal-appt-query-cache`
 * Throttle:   1 000 ms (writes are batched, not every state change)
 * Max age:    10 min (mirrors gcTime — stale entries are evicted on restore)
 * Buster:     "v1" — bump when shipping a breaking data-shape change to force
 *             all clients to drop their persisted caches.
 */
function getPersister() {
  if (typeof window === "undefined") return null;
  try {
    return createAsyncStoragePersister({
      storage: window.localStorage,
      key: "cal-appt-query-cache",
      throttleTime: 1000,
    });
  } catch {
    return null;
  }
}

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => createQueryClient());
  const [persister] = useState(() => getPersister());
  const showDevtools = process.env.NEXT_PUBLIC_RQ_DEVTOOLS === "1";

  const devtools = showDevtools ? <ReactQueryDevtools initialIsOpen={false} /> : null;

  /*
   * If localStorage is available, use PersistQueryClientProvider so the cache
   * survives page refreshes. Otherwise fall back to the plain provider.
   */
  if (persister) {
    return (
      <PersistQueryClientProvider
        client={queryClient}
        persistOptions={{
          persister,
          maxAge: 10 * 60 * 1000,
          buster: "v1",
        }}
      >
        {children}
        {devtools}
      </PersistQueryClientProvider>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {devtools}
    </QueryClientProvider>
  );
}
