import { QueryClient } from "@tanstack/react-query";

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
