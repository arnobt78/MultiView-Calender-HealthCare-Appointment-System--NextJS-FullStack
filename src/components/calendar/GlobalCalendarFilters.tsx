"use client";

import { useMemo } from "react";
import { useAppointmentData } from "@/context/AppointmentDataContext";
import { useCalendarFilters } from "@/context/CalendarFiltersContext";
import type { Category, Patient } from "@/types/types";
import { useAuth } from "@/hooks/useAuth";
import { isPatientRole } from "@/lib/rbac";
import { ClinicalListFilterToolbar } from "@/components/shared/filters/ClinicalListFilterToolbar";
import { buildCalendarMonthFilterOptions } from "@/lib/calendar-date-display";
import Filters from "./Filters";

type GlobalCalendarFiltersProps = {
  categories: Category[];
  patients: Patient[];
  className?: string;
};

/** Dashboard list/day/week/month filters — one toolbar row; Reset aligns right like CP entity lists. */
export default function GlobalCalendarFilters({
  categories,
  patients,
  className,
}: GlobalCalendarFiltersProps) {
  const { appointments } = useAppointmentData();
  const { user } = useAuth();
  const showClinicalRoleFilter = Boolean(
    user?.id && user.role && !isPatientRole(user.role)
  );
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
    clinicalRole,
    setClinicalRole,
    resetFilters,
    hasActiveFilters,
  } = useCalendarFilters();

  const monthOptions = useMemo(
    () => buildCalendarMonthFilterOptions(appointments.map((a) => a.start)),
    [appointments]
  );

  return (
    <ClinicalListFilterToolbar
      className={className ?? "w-full"}
      search={{
        value: search,
        onChange: setSearch,
        placeholder: "Search… (Name, Title, Notes)",
        ariaLabel: "Search appointments by name, title, or notes",
      }}
      showReset={hasActiveFilters}
      onReset={resetFilters}
    >
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
        clinicalRole={clinicalRole}
        setClinicalRole={setClinicalRole}
        showClinicalRoleFilter={showClinicalRoleFilter}
      />
    </ClinicalListFilterToolbar>
  );
}
