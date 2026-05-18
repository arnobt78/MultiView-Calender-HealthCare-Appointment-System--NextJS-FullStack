"use client";

/**
 * `/services` Appointment Services grid — `GET /api/appointment-types/catalog`.
 * Refetches when `invalidateAppointmentTypeDerived` runs (prefix `appointmentTypes.all`).
 */

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type { ServiceCatalogRow } from "@/lib/appointment-service-catalog";
import { queryKeys } from "@/lib/query-keys";

export function useAppointmentServiceCatalog(initialCatalog?: ServiceCatalogRow[] | null) {
  return useQuery({
    queryKey: queryKeys.appointmentTypes.catalog,
    queryFn: () => apiClient<{ services: ServiceCatalogRow[] }>("/api/appointment-types/catalog"),
    initialData: initialCatalog?.length ? { services: initialCatalog } : undefined,
    staleTime: 5 * 60 * 1000,
  });
}
