"use client";

import { Filter, Layers, Stethoscope } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { GlassResetFilterButton } from "@/components/shared/GlassResetFilterButton";
import {
  SERVICES_CATALOG_FILTER_ADDITIONAL,
  SERVICES_CATALOG_FILTER_ALL,
  SERVICES_CATALOG_FILTER_GLOBAL,
  serviceCatalogFilterValue,
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

function resolveFilterLabel(selection: string, services: ServiceCatalogRow[]): string {
  if (selection === SERVICES_CATALOG_FILTER_ALL) return "All services";
  if (selection === SERVICES_CATALOG_FILTER_GLOBAL) return "Global visit types";
  if (selection === SERVICES_CATALOG_FILTER_ADDITIONAL) return "Additional types";
  const row = services.find((s) => serviceCatalogFilterValue(s.id, s.source) === selection);
  return row?.name ?? "Service type";
}

/** Icon dropdown for `/services` Appointment Services — source buckets + per-type options. */
export function ServicesServiceFilters({
  services,
  filters,
  onChange,
  onReset,
  hasActiveFilter,
}: Props) {
  const label = resolveFilterLabel(filters.selection, services);
  const globals = services.filter((s) => s.source === "global");
  const additionals = services.filter((s) => s.source === "additional");

  return (
    <div className="flex flex-wrap items-center justify-end gap-2 shrink-0">
      <Select
        value={filters.selection}
        onValueChange={(v) => onChange({ selection: v })}
      >
        <SelectTrigger className="h-9 w-auto min-w-[160px] rounded-2xl border-gray-200 bg-white text-gray-700 shadow-sm gap-2">
          <Filter className="h-3.5 w-3.5 text-gray-400 shrink-0" />
          <SelectValue>{label}</SelectValue>
        </SelectTrigger>
        <SelectContent className="max-h-[min(320px,70vh)]">
          <SelectItem value={SERVICES_CATALOG_FILTER_ALL}>All services</SelectItem>
          <SelectItem value={SERVICES_CATALOG_FILTER_GLOBAL}>
            <span className="flex items-center gap-2">
              <Layers className="h-3.5 w-3.5 text-violet-600" />
              Global visit types
            </span>
          </SelectItem>
          <SelectItem value={SERVICES_CATALOG_FILTER_ADDITIONAL}>
            <span className="flex items-center gap-2">
              <Stethoscope className="h-3.5 w-3.5 text-emerald-600" />
              Additional appointment types
            </span>
          </SelectItem>
          {globals.length > 0 ? (
            <>
              <SelectSeparator />
              <SelectGroup>
                <SelectLabel className="text-violet-700">Global templates</SelectLabel>
                {globals.map((s) => (
                  <SelectItem
                    key={serviceCatalogFilterValue(s.id, s.source)}
                    value={serviceCatalogFilterValue(s.id, s.source)}
                  >
                    {s.name} · {s.duration_minutes} min
                  </SelectItem>
                ))}
              </SelectGroup>
            </>
          ) : null}
          {additionals.length > 0 ? (
            <>
              <SelectSeparator />
              <SelectGroup>
                <SelectLabel className="text-emerald-800">Additional types</SelectLabel>
                {additionals.map((s) => (
                  <SelectItem
                    key={serviceCatalogFilterValue(s.id, s.source)}
                    value={serviceCatalogFilterValue(s.id, s.source)}
                  >
                    {s.name} · {s.duration_minutes} min
                  </SelectItem>
                ))}
              </SelectGroup>
            </>
          ) : null}
        </SelectContent>
      </Select>
      {hasActiveFilter ? <GlassResetFilterButton onClick={onReset} label="Reset" /> : null}
    </div>
  );
}
