"use client";

import { Category, Patient } from "@/types/types";
import { Input } from "@/components/ui/input";
import { ClinicalListFilterToolbar } from "@/components/shared/filters/ClinicalListFilterToolbar";
import { FilterSelect } from "@/components/shared/filters/FilterSelect";
import { Tag, User, CalendarDays, Circle, CalendarRange } from "lucide-react";

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
  onReset: () => void;
  showReset: boolean;
};

const ALL_VALUE = "__all__";
const STATUS_LABEL: Record<string, string> = {
  pending: "Open",
  done: "Done",
  alert: "Alert",
};

/** Dashboard calendar filter row — shared `ClinicalListFilterToolbar` reset alignment. */
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
  onReset,
  showReset,
}: FiltersProps) {
  const categoryLabel = !category
    ? "All Categories"
    : categories.find((c) => c.id === category)?.label ?? "All Categories";
  const selectedPatient = patient ? patients.find((x) => x.id === patient) : undefined;
  const clientLabel = !patient
    ? "All Clients"
    : selectedPatient
      ? `${selectedPatient.firstname} ${selectedPatient.lastname}`.trim()
      : "All Clients";
  const statusLabel = !status ? "All Statuses" : STATUS_LABEL[status] ?? "All Statuses";
  const monthLabel =
    !month
      ? "Monthly View"
      : monthOptions.find((m) => m.value === month)?.label ?? "Monthly View";

  return (
    <ClinicalListFilterToolbar showReset={showReset} onReset={onReset}>
      <FilterSelect
        value={category ?? ALL_VALUE}
        onValueChange={(v) => setCategory(v === ALL_VALUE ? null : v)}
        displayLabel={categoryLabel}
        icon={Tag}
        size="dashboard"
        triggerClassName="min-w-[160px]"
        options={[
          { value: ALL_VALUE, label: "All Categories" },
          ...categories.map((c) => ({ value: c.id, label: c.label })),
        ]}
      />

      <FilterSelect
        value={patient ?? ALL_VALUE}
        onValueChange={(v) => setPatient(v === ALL_VALUE ? null : v)}
        displayLabel={clientLabel}
        icon={User}
        size="dashboard"
        triggerClassName="min-w-[160px]"
        options={[
          { value: ALL_VALUE, label: "All Clients" },
          ...patients.map((p) => ({
            value: p.id,
            label: `${p.firstname} ${p.lastname}`.trim(),
          })),
        ]}
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
    </ClinicalListFilterToolbar>
  );
}
