"use client";

import { Search, Stethoscope, CalendarDays } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { GlassResetFilterButton } from "@/components/shared/GlassResetFilterButton";
import { SPECIALTIES } from "@/lib/doctor-specialty";

const ALL = "__all__";
const WEEKDAYS = [
  { value: "0", label: "Sunday" },
  { value: "1", label: "Monday" },
  { value: "2", label: "Tuesday" },
  { value: "3", label: "Wednesday" },
  { value: "4", label: "Thursday" },
  { value: "5", label: "Friday" },
  { value: "6", label: "Saturday" },
] as const;

export type ServicesDoctorFilterState = {
  search: string;
  specialty: string | null;
  weekday: number | null;
  date: string | null;
};

export const defaultServicesDoctorFilters = (): ServicesDoctorFilterState => ({
  search: "",
  specialty: null,
  weekday: null,
  date: null,
});

type Props = {
  filters: ServicesDoctorFilterState;
  onChange: (next: ServicesDoctorFilterState) => void;
  onReset: () => void;
  hasActiveFilters: boolean;
};

/** Client-side filters for /services doctor grid — mirrors calendar filter chrome. */
export function ServicesDoctorFilters({ filters, onChange, onReset, hasActiveFilters }: Props) {
  const specialtyLabel = filters.specialty ?? "All Specialties";
  const dayLabel =
    filters.weekday != null
      ? WEEKDAYS.find((w) => Number(w.value) === filters.weekday)?.label ?? "Day"
      : "All Days";

  return (
    <div className="flex flex-wrap items-center justify-end gap-2 w-full lg:w-auto">
      <div className="relative w-full sm:w-[200px] lg:w-[220px]">
        <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
        <Input
          value={filters.search}
          onChange={(e) => onChange({ ...filters, search: e.target.value })}
          placeholder="Search doctors…"
          className="h-9 rounded-2xl border-gray-200 bg-white pl-9 text-sm shadow-sm"
        />
      </div>

      <Select
        value={filters.specialty ?? ALL}
        onValueChange={(v) => onChange({ ...filters, specialty: v === ALL ? null : v })}
      >
        <SelectTrigger className="h-9 w-auto min-w-[150px] rounded-2xl border-gray-200 bg-white text-gray-700 shadow-sm gap-2">
          <Stethoscope className="h-3.5 w-3.5 text-gray-400 shrink-0" />
          <SelectValue>{specialtyLabel}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>All Specialties</SelectItem>
          {SPECIALTIES.map((s) => (
            <SelectItem key={s} value={s}>
              {s}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.weekday != null ? String(filters.weekday) : ALL}
        onValueChange={(v) =>
          onChange({
            ...filters,
            weekday: v === ALL ? null : Number(v),
            date: v === ALL ? filters.date : null,
          })
        }
      >
        <SelectTrigger className="h-9 w-auto min-w-[130px] rounded-2xl border-gray-200 bg-white text-gray-700 shadow-sm gap-2">
          <CalendarDays className="h-3.5 w-3.5 text-gray-400 shrink-0" />
          <SelectValue>{dayLabel}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>All Days</SelectItem>
          {WEEKDAYS.map((w) => (
            <SelectItem key={w.value} value={w.value}>
              {w.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Input
        type="date"
        value={filters.date ?? ""}
        onChange={(e) => {
          const date = e.target.value || null;
          const weekday =
            date != null && date.length > 0 ? new Date(`${date}T12:00:00`).getDay() : null;
          onChange({ ...filters, date, weekday });
        }}
        className="h-9 w-[140px] rounded-2xl border-gray-200 bg-white text-gray-700 shadow-sm"
        aria-label="Filter by date"
      />

      {hasActiveFilters && <GlassResetFilterButton onClick={onReset} label="Reset" />}
    </div>
  );
}
