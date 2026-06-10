"use client";

import { useQueryClient, type QueryKey } from "@tanstack/react-query";

/**
 * True when list query is loading and SSR/cache has not seeded data yet.
 * Uses `data !== undefined` so empty arrays from SSR still count as warm cache.
 */
export function useCpListBodyLoading(queryKey: QueryKey, isLoading: boolean): boolean {
  const queryClient = useQueryClient();
  const hasCache = queryClient.getQueryState(queryKey)?.data !== undefined;
  return isLoading && !hasCache;
}

/** Composite warm-cache check for doctor-management (users + directory). */
export function useCpDoctorListBodyLoading(
  usersKey: QueryKey,
  doctorsKey: QueryKey,
  usersLoading: boolean,
  doctorsLoading: boolean
): boolean {
  const queryClient = useQueryClient();
  const usersWarm = queryClient.getQueryState(usersKey)?.data !== undefined;
  const doctorsWarm = queryClient.getQueryState(doctorsKey)?.data !== undefined;
  const loading = usersLoading || doctorsLoading;
  return loading && !(usersWarm && doctorsWarm);
}
