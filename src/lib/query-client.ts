import { QueryClient } from "@tanstack/react-query";
import { queryKeys } from "./query-keys";

/**
 * Creates and configures the default QueryClient for the application.
 */
export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Data is considered fresh for 1 minute
        staleTime: 60 * 1000,
        // Keep unused data in cache for 5 minutes
        gcTime: 5 * 60 * 1000,
        // Retry failed queries once by default
        retry: 1,
        // Refetch on window focus is often confusing for users, disable unless explicitly needed
        refetchOnWindowFocus: false,
      },
      mutations: {
        retry: 0,
      },
    },
  });
}

/**
 * Invalidate all app queries (lists + details). Use after any CRUD so the whole UI updates without page refresh.
 */
export async function invalidateAllForCrud(queryClient: QueryClient) {
  await queryClient.invalidateQueries({ queryKey: queryKeys.root });
}

/**
 * Invalidate only calendar appointment data.
 * Use this after appointment CRUD/toggle actions to avoid full-app refetch storms.
 */
export async function invalidateAppointmentData(queryClient: QueryClient) {
  await queryClient.invalidateQueries({ queryKey: queryKeys.appointments.all });
}
