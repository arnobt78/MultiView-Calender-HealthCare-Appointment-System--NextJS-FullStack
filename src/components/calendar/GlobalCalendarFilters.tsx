"use client";

import { useMemo } from "react";
import { useAppointmentData } from "@/context/AppointmentDataContext";
import { useCalendarFilters } from "@/context/CalendarFiltersContext";
import type { Category, Patient } from "@/types/types";
import SearchBar from "./SearchBar";
import Filters from "./Filters";

type GlobalCalendarFiltersProps = {
  categories: Category[];
  patients: Patient[];
  className?: string;
};

export default function GlobalCalendarFilters({
  categories,
  patients,
  className,
}: GlobalCalendarFiltersProps) {
  const { appointments } = useAppointmentData();
  const {
    category,
    setCategory,
    patient,
    setPatient,
    date,
    setDate,
    status,
    setStatus,
    month,
    setMonth,
    search,
    setSearch,
    resetFilters,
    hasActiveFilters,
  } = useCalendarFilters();

  const monthOptions = useMemo(() => {
    const all = new Set<string>();
    appointments.forEach((a) => {
      const d = new Date(a.start);
      all.add(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
    });
    return Array.from(all)
      .sort((a, b) => b.localeCompare(a))
      .map((value) => {
        const [year, monthPart] = value.split("-");
        const formatted = new Intl.DateTimeFormat("de-DE", {
          month: "long",
          year: "numeric",
        }).format(new Date(Number(year), Number(monthPart) - 1, 1));
        return { value, label: formatted };
      });
  }, [appointments]);

  return (
    <div className={`flex flex-wrap items-center gap-2 w-full ${className ?? ""}`}>
      <div className="w-full sm:flex-1 sm:min-w-[220px] sm:max-w-sm">
        <SearchBar value={search} setValue={setSearch} />
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Filters
          category={category}
          setCategory={setCategory}
          patient={patient}
          setPatient={setPatient}
          date={date}
          setDate={setDate}
          status={status}
          setStatus={setStatus}
          month={month}
          setMonth={setMonth}
          monthOptions={monthOptions}
          categories={categories}
          patients={patients}
          showReset={hasActiveFilters}
          onReset={resetFilters}
        />
      </div>
    </div>
  );
}
