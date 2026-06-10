"use client";

import { useQueryClient, type QueryClient, type QueryKey } from "@tanstack/react-query";

/**
 * Pure helper — testable without renderHook.
 * True when loading and SSR/persist/cache has not seeded data yet.
 */
export function getQueryBodyLoadingState(
  queryClient: QueryClient,
  queryKey: QueryKey,
  isLoading: boolean
): boolean {
  const hasCache = queryClient.getQueryState(queryKey)?.data !== undefined;
  return isLoading && !hasCache;
}

/**
 * True when a query is loading and SSR/persist/cache has not seeded data yet.
 * Uses `data !== undefined` so empty arrays from SSR still count as warm cache.
 */
export function useQueryBodyLoading(queryKey: QueryKey, isLoading: boolean): boolean {
  const queryClient = useQueryClient();
  return getQueryBodyLoadingState(queryClient, queryKey, isLoading);
}

/** Pure composite warm-cache check — all keys must be warm before suppressing skeleton. */
export function getCompositeQueryBodyLoadingState(
  queryClient: QueryClient,
  keys: QueryKey[],
  isLoading: boolean
): boolean {
  const allWarm = keys.every(
    (key) => queryClient.getQueryState(key)?.data !== undefined
  );
  return isLoading && !allWarm;
}

/**
 * Composite warm-cache check — all keys must be warm before suppressing body skeleton.
 */
export function useCompositeQueryBodyLoading(
  queryKeys: QueryKey[],
  isLoading: boolean
): boolean {
  const queryClient = useQueryClient();
  return getCompositeQueryBodyLoadingState(queryClient, queryKeys, isLoading);
}

/** @deprecated Use useQueryBodyLoading — CP alias kept for backward compat. */
export const useCpListBodyLoading = useQueryBodyLoading;

/** @deprecated Use useCompositeQueryBodyLoading — CP alias kept for backward compat. */
export function useCpDoctorListBodyLoading(
  usersKey: QueryKey,
  doctorsKey: QueryKey,
  usersLoading: boolean,
  doctorsLoading: boolean
): boolean {
  return useCompositeQueryBodyLoading(
    [usersKey, doctorsKey],
    usersLoading || doctorsLoading
  );
}
