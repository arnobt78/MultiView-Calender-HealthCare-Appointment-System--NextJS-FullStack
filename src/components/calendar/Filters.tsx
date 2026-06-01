"use client";

import { Category, Patient } from "@/types/types";
import { Input } from "@/components/ui/input";
import { FilterSelect } from "@/components/shared/filters/FilterSelect";
import { CategoryFilterSelect } from "@/components/shared/filters/CategoryFilterSelect";
import { PatientFilterSelect } from "@/components/shared/filters/PatientFilterSelect";
import {
  CALENDAR_CLINICAL_ROLE_FILTER_OPTIONS,
  calendarClinicalRoleFilterLabel,
  type CalendarClinicalRoleFilter,
} from "@/lib/calendar-clinical-role-filter";
import { CalendarDays, Circle, CalendarRange, Stethoscope } from "lucide-react";

type FiltersProps = {
  category: string | null;
  setCategory: (v: string | null) => void;
  patient: string | null;
  setPatient: (v: string | null) => void;
  date: string | null;
  setDate: (v: string | null) => void;
  status: string | null;
  setStatus: (v: string | null) => void;
  month: string | null;
  setMonth: (v: string | null) => void;
  monthOptions: { value: string; label: string }[];
  categories: Category[];
  patients: Patient[];
  clinicalRole: CalendarClinicalRoleFilter;
  setClinicalRole: (v: CalendarClinicalRoleFilter) => void;
  showClinicalRoleFilter: boolean;
};

const ALL_VALUE = "__all__";
const STATUS_LABEL: Record<string, string> = {
  pending: "Open",
  done: "Done",
  alert: "Alert",
};

/** Dashboard calendar filter controls — parent wraps with `ClinicalListFilterToolbar` + search. */
export default function Filters({
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
  monthOptions,
  categories,
  patients,
  clinicalRole,
  setClinicalRole,
  showClinicalRoleFilter,
}: FiltersProps) {
  const statusLabel = !status ? "All Statuses" : STATUS_LABEL[status] ?? "All Statuses";
  const monthLabel =
    !month
      ? "Monthly View"
      : monthOptions.find((m) => m.value === month)?.label ?? "Monthly View";

  return (
    <>
      {showClinicalRoleFilter ? (
        <FilterSelect
          value={clinicalRole}
          onValueChange={(v) => setClinicalRole(v as CalendarClinicalRoleFilter)}
          displayLabel={calendarClinicalRoleFilterLabel(clinicalRole)}
          icon={Stethoscope}
          size="dashboard"
          triggerClassName="min-w-[200px]"
          ariaLabel="Filter by calendar role"
          options={CALENDAR_CLINICAL_ROLE_FILTER_OPTIONS.map((o) => ({
            value: o.value,
            label: o.label,
          }))}
        />
      ) : null}

      <CategoryFilterSelect
        value={category}
        onValueChange={setCategory}
        categories={categories}
      />

      <PatientFilterSelect
        value={patient}
        onValueChange={setPatient}
        patients={patients}
      />

      <div className="relative flex items-center">
        <CalendarDays className="absolute left-3 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
        <Input
          id="filter-date"
          type="date"
          aria-label="Filter by date"
          title="Filter by date"
          className="h-9 pl-8 w-auto min-w-[155px] rounded-2xl shadow-sm bg-white border-gray-200 text-gray-700 cursor-pointer"
          value={date ?? ""}
          onChange={(e) => setDate(e.target.value || null)}
        />
      </div>

      <FilterSelect
        value={status ?? ALL_VALUE}
        onValueChange={(v) => setStatus(v === ALL_VALUE ? null : v)}
        displayLabel={statusLabel}
        icon={Circle}
        size="dashboard"
        triggerClassName="min-w-[140px]"
        options={[
          { value: ALL_VALUE, label: "All Statuses" },
          { value: "pending", label: "Open" },
          { value: "done", label: "Done" },
          { value: "alert", label: "Alert" },
        ]}
      />

      <FilterSelect
        value={month ?? ALL_VALUE}
        onValueChange={(v) => setMonth(v === ALL_VALUE ? null : v)}
        displayLabel={monthLabel}
        icon={CalendarRange}
        size="dashboard"
        triggerClassName="min-w-[155px]"
        options={[
          { value: ALL_VALUE, label: "Monthly View" },
          ...monthOptions.map((m) => ({ value: m.value, label: m.label })),
        ]}
      />
    </>
  );
}
