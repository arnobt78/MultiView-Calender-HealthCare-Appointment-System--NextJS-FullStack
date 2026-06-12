"use client";

import { Search, CalendarDays } from "lucide-react";
import { Input } from "@/components/ui/input";
import { GlassResetFilterButton } from "@/components/shared/GlassResetFilterButton";
import { FilterSelect } from "@/components/shared/filters/FilterSelect";
import { ServicesCatalogTypeSelect } from "@/components/services/ServicesCatalogTypeSelect";
import { SERVICES_CATALOG_FILTER_ALL, type ServiceCatalogRow } from "@/lib/appointment-service-catalog";
import { SPECIALTIES } from "@/lib/doctor-specialty";
import {
  allWeekdayFilterOptions,
  doctorSpecialtyFilterOptions,
  findFilterOptionLabel,
} from "@/lib/filter-select-option-presets";

const WEEKDAY_LABELS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

const SPECIALTY_OPTIONS = doctorSpecialtyFilterOptions(SPECIALTIES);
const WEEKDAY_OPTIONS = allWeekdayFilterOptions(WEEKDAY_LABELS);

export type ServicesDoctorFilterState = {
  search: string;
  specialty: string | null;
  weekday: number | null;
  date: string | null;
  /** Visit-type catalog filter — limits doctor grid (`filterDoctorsByServiceCatalog`). */
  serviceSelection: string;
};

export const defaultServicesDoctorFilters = (): ServicesDoctorFilterState => ({
  search: "",
  specialty: null,
  weekday: null,
  date: null,
  serviceSelection: SERVICES_CATALOG_FILTER_ALL,
});

type Props = {
  catalogServices: ServiceCatalogRow[];
  filters: ServicesDoctorFilterState;
  onChange: (next: ServicesDoctorFilterState) => void;
  onReset: () => void;
  hasActiveFilters: boolean;
};

/** Client-side filters for /services doctor grid — mirrors calendar filter chrome. */
export function ServicesDoctorFilters({
  catalogServices,
  filters,
  onChange,
  onReset,
  hasActiveFilters,
}: Props) {
  const specialtyValue = filters.specialty ?? "all";
  const weekdayValue = filters.weekday != null ? String(filters.weekday) : "all";
  const specialtyLabel = findFilterOptionLabel(
    SPECIALTY_OPTIONS,
    specialtyValue,
    "All Specialties"
  );
  const dayLabel = findFilterOptionLabel(WEEKDAY_OPTIONS, weekdayValue, "All Days");

  return (
    <div className="flex flex-wrap items-center justify-end gap-2 w-full lg:w-auto shrink-0">
      <div className="relative w-full sm:w-[200px] lg:w-[220px]">
        <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
        <Input
          value={filters.search}
          onChange={(e) => onChange({ ...filters, search: e.target.value })}
          placeholder="Search doctors…"
          className="h-9 rounded-2xl border-gray-200 bg-white pl-9 text-sm shadow-sm"
        />
      </div>

      <ServicesCatalogTypeSelect
        services={catalogServices}
        value={filters.serviceSelection}
        onValueChange={(serviceSelection) => onChange({ ...filters, serviceSelection })}
      />

      <FilterSelect
        value={specialtyValue}
        onValueChange={(v) =>
          onChange({ ...filters, specialty: v === "all" ? null : v })
        }
        displayLabel={specialtyLabel}
        size="dashboard"
        triggerClassName="min-w-[150px]"
        ariaLabel="Filter by specialty"
        options={SPECIALTY_OPTIONS}
      />

      <FilterSelect
        value={weekdayValue}
        onValueChange={(v) =>
          onChange({
            ...filters,
            weekday: v === "all" ? null : Number(v),
            date: v === "all" ? filters.date : null,
          })
        }
        displayLabel={dayLabel}
        size="dashboard"
        triggerClassName="min-w-[130px]"
        ariaLabel="Filter by weekday"
        options={WEEKDAY_OPTIONS}
      />

      <div className="relative flex items-center shrink-0">
        <CalendarDays className="absolute left-3 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
        <Input
          type="date"
          value={filters.date ?? ""}
          onChange={(e) => {
            const date = e.target.value || null;
            const weekday =
              date != null && date.length > 0 ? new Date(`${date}T12:00:00`).getDay() : null;
            onChange({ ...filters, date, weekday });
          }}
          className="h-9 pl-8 w-auto min-w-[155px] rounded-2xl border-gray-200 bg-white text-gray-700 shadow-sm cursor-pointer"
          aria-label="Filter by date"
          title="Filter by date"
        />
      </div>

      {hasActiveFilters && <GlassResetFilterButton onClick={onReset} label="Reset" />}
    </div>
  );
}
