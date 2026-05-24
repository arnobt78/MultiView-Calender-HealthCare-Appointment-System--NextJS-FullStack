"use client";

import { GlassResetFilterButton } from "@/components/shared/GlassResetFilterButton";
import { ServicesCatalogTypeSelect } from "@/components/services/ServicesCatalogTypeSelect";
import {
  SERVICES_CATALOG_FILTER_ALL,
  type ServiceCatalogRow,
  type ServicesCatalogFilterState,
} from "@/lib/appointment-service-catalog";

export type { ServicesCatalogFilterState };

export const defaultServicesCatalogFilter = (): ServicesCatalogFilterState => ({
  selection: SERVICES_CATALOG_FILTER_ALL,
});

type Props = {
  services: ServiceCatalogRow[];
  filters: ServicesCatalogFilterState;
  onChange: (next: ServicesCatalogFilterState) => void;
  onReset: () => void;
  hasActiveFilter: boolean;
};

/** Optional standalone wrapper — prefer `ServicesCatalogTypeSelect` inline in `ServicesDoctorFilters`. */
export function ServicesServiceFilters({
  services,
  filters,
  onChange,
  onReset,
  hasActiveFilter,
}: Props) {
  return (
    <div className="flex flex-wrap items-center justify-end gap-2 shrink-0">
      <ServicesCatalogTypeSelect
        services={services}
        value={filters.selection}
        onValueChange={(selection) => onChange({ selection })}
      />
      {hasActiveFilter ? <GlassResetFilterButton onClick={onReset} label="Reset" /> : null}
    </div>
  );
}
