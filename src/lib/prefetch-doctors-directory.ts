/**
 * Warm `queryKeys.doctors.all` before patient booking or `/services` navigation.
 */

import type { QueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type { DoctorsDirectoryResponse } from "@/lib/doctor-directory";
import { queryKeys } from "@/lib/query-keys";

export const DOCTORS_DIRECTORY_PREFETCH_STALE_MS = 5 * 60 * 1000;

export function prefetchDoctorsDirectory(queryClient: QueryClient): void {
  void queryClient.prefetchQuery({
    queryKey: queryKeys.doctors.all,
    queryFn: () => apiClient<DoctorsDirectoryResponse>("/api/doctors"),
    staleTime: DOCTORS_DIRECTORY_PREFETCH_STALE_MS,
  });
}
