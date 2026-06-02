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
import {
  SERVICES_CATALOG_FILTER_ADDITIONAL,
  SERVICES_CATALOG_FILTER_ALL,
  SERVICES_CATALOG_FILTER_GLOBAL,
  serviceCatalogFilterValue,
  type ServiceCatalogRow,
} from "@/lib/appointment-service-catalog";
import { APPOINTMENT_TYPE_COPY } from "@/lib/appointment-type-copy";
import { cn, toTitleCaseLabel } from "@/lib/utils";

function serviceRowOptionLabel(name: string, durationMinutes: number): string {
  return toTitleCaseLabel(`${name} · ${durationMinutes} min`);
}

function resolveFilterLabel(selection: string, services: ServiceCatalogRow[]): string {
  if (selection === SERVICES_CATALOG_FILTER_ALL) return toTitleCaseLabel("All services");
  if (selection === SERVICES_CATALOG_FILTER_GLOBAL) {
    return toTitleCaseLabel(APPOINTMENT_TYPE_COPY.globalCatalogFilterLabel);
  }
  if (selection === SERVICES_CATALOG_FILTER_ADDITIONAL) {
    return toTitleCaseLabel("Additional appointment types");
  }
  const row = services.find((s) => serviceCatalogFilterValue(s.id, s.source) === selection);
  return row ? serviceRowOptionLabel(row.name, row.duration_minutes) : toTitleCaseLabel("Service type");
}

type ServicesCatalogTypeSelectProps = {
  services: ServiceCatalogRow[];
  value: string;
  onValueChange: (selection: string) => void;
  className?: string;
  triggerClassName?: string;
};

/**
 * Shared visit-type filter dropdown — `/services` doctor toolbar (filters doctor grid by bookable types).
 */
export function ServicesCatalogTypeSelect({
  services,
  value,
  onValueChange,
  className,
  triggerClassName,
}: ServicesCatalogTypeSelectProps) {
  const label = resolveFilterLabel(value, services);
  const globals = services.filter((s) => s.source === "global");
  const additionals = services.filter((s) => s.source === "additional");

  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger
        className={cn(
          "h-9 w-auto min-w-[160px] rounded-2xl border-gray-200 bg-white text-gray-700 shadow-sm gap-2",
          triggerClassName
        )}
      >
        <Filter className="h-3.5 w-3.5 text-gray-400 shrink-0" />
        <SelectValue>{label}</SelectValue>
      </SelectTrigger>
      <SelectContent className={cn("max-h-[min(320px,70vh)]", className)}>
        <SelectItem value={SERVICES_CATALOG_FILTER_ALL}>{toTitleCaseLabel("All services")}</SelectItem>
        <SelectItem value={SERVICES_CATALOG_FILTER_GLOBAL}>
          <span className="flex items-center gap-2">
            <Layers className="h-3.5 w-3.5 text-violet-600" />
            {toTitleCaseLabel(APPOINTMENT_TYPE_COPY.globalCatalogFilterLabel)}
          </span>
        </SelectItem>
        <SelectItem value={SERVICES_CATALOG_FILTER_ADDITIONAL}>
          <span className="flex items-center gap-2">
            <Stethoscope className="h-3.5 w-3.5 text-emerald-600" />
            {toTitleCaseLabel("Additional appointment types")}
          </span>
        </SelectItem>
        {globals.length > 0 ? (
          <>
            <SelectSeparator />
            <SelectGroup>
              <SelectLabel className="text-violet-700">
                {toTitleCaseLabel(APPOINTMENT_TYPE_COPY.globalCatalogGroupLabel)}
              </SelectLabel>
              {globals.map((s) => (
                <SelectItem
                  key={serviceCatalogFilterValue(s.id, s.source)}
                  value={serviceCatalogFilterValue(s.id, s.source)}
                >
                  {serviceRowOptionLabel(s.name, s.duration_minutes)}
                </SelectItem>
              ))}
            </SelectGroup>
          </>
        ) : null}
        {additionals.length > 0 ? (
          <>
            <SelectSeparator />
            <SelectGroup>
              <SelectLabel className="text-emerald-800">
                {toTitleCaseLabel("Additional types")}
              </SelectLabel>
              {additionals.map((s) => (
                <SelectItem
                  key={serviceCatalogFilterValue(s.id, s.source)}
                  value={serviceCatalogFilterValue(s.id, s.source)}
                >
                  {serviceRowOptionLabel(s.name, s.duration_minutes)}
                </SelectItem>
              ))}
            </SelectGroup>
          </>
        ) : null}
      </SelectContent>
    </Select>
  );
}
