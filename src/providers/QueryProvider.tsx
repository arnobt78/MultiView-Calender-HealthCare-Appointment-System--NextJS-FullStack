"use client";

import { useEffect, useState } from "react";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import type { Persister } from "@tanstack/react-query-persist-client";
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";
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
 * Max age:    24 h — returning users see instant cached data for a full day.
 * Buster:     "v2" — bump when shipping a breaking data-shape change to force
 *             all clients to drop their persisted caches.
 */
/**
 * No-op persister used during SSR and the first client frame before
 * localStorage is available.  Satisfies the Persister interface without
 * touching the DOM so the React tree stays identical across SSR and
 * hydration (no mismatch, no remount of children).
 */
const noopPersister: Persister = {
  persistClient: async () => {},
  restoreClient: async () => undefined,
  removeClient: async () => {},
};

function buildPersister(): Persister | null {
  if (typeof window === "undefined") return null;
  try {
    return createAsyncStoragePersister({
      storage: window.localStorage,
      key: "cal-appt-query-cache",
      throttleTime: 1_000,
    });
  } catch {
    return null;
  }
}

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => createQueryClient());
  /**
   * Start with the no-op persister so the initial SSR HTML and the
   * hydration frame use the same provider tree (avoids mismatch).
   * After mount, swap in the real localStorage persister via useEffect
   * so it only runs in the browser.
   */
  const [persister, setPersister] = useState<Persister>(noopPersister);

  // Swap in the real localStorage persister after the first browser paint.
  // setState inside useEffect is intentional here — it runs exactly once, after
  // SSR/hydration, to attach the persister without causing a hydration mismatch.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { const real = buildPersister(); if (real) setPersister(real); }, []);

  const showDevtools = process.env.NEXT_PUBLIC_RQ_DEVTOOLS === "1";

  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister,
        // 24 h — returning users see instant cached data for a full day.
        maxAge: 24 * 60 * 60 * 1_000,
        // Bump "buster" when shipping a breaking data-shape change to force
        // all clients to drop their persisted caches.
        buster: "v2",
      }}
    >
      {children}
      {showDevtools && <ReactQueryDevtools initialIsOpen={false} />}
    </PersistQueryClientProvider>
  );
}
