"use client";

import { Category, Patient } from "@/types/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tag, User, CalendarDays, Circle, RotateCcw } from "lucide-react";

type FiltersProps = {
  category: string | null;
  setCategory: (v: string | null) => void;
  patient: string | null;
  setPatient: (v: string | null) => void;
  date: string | null;
  setDate: (v: string | null) => void;
  status: string | null;
  setStatus: (v: string | null) => void;
  categories: Category[];
  patients: Patient[];
  onReset: () => void;
};

const ALL_VALUE = "__all__";
const STATUS_LABEL: Record<string, string> = {
  pending: "Open",
  done: "Done",
  alert: "Alert",
};

export default function Filters({
  category,
  setCategory,
  patient,
  setPatient,
  date,
  setDate,
  status,
  setStatus,
  categories,
  patients,
  onReset,
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

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Category */}
      <Select
        value={category ?? ALL_VALUE}
        onValueChange={(v) => setCategory(v === ALL_VALUE ? null : v)}
      >
        <SelectTrigger className="h-9 w-auto min-w-[160px] rounded-2xl shadow-sm bg-white border-gray-200 text-gray-700 gap-2">
          <Tag className="w-3.5 h-3.5 text-gray-400 shrink-0" />
          <SelectValue>{categoryLabel}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL_VALUE}>All Categories</SelectItem>
          {categories.map((c) => (
            <SelectItem key={c.id} value={c.id}>
              {c.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Client */}
      <Select
        value={patient ?? ALL_VALUE}
        onValueChange={(v) => setPatient(v === ALL_VALUE ? null : v)}
      >
        <SelectTrigger className="h-9 w-auto min-w-[160px] rounded-2xl shadow-sm bg-white border-gray-200 text-gray-700 gap-2">
          <User className="w-3.5 h-3.5 text-gray-400 shrink-0" />
          <SelectValue>{clientLabel}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL_VALUE}>All Clients</SelectItem>
          {patients.map((p) => (
            <SelectItem key={p.id} value={p.id}>
              {p.firstname} {p.lastname}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Date */}
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

      {/* Status */}
      <Select
        value={status ?? ALL_VALUE}
        onValueChange={(v) => setStatus(v === ALL_VALUE ? null : v)}
      >
        <SelectTrigger className="h-9 w-auto min-w-[140px] rounded-2xl shadow-sm bg-white border-gray-200 text-gray-700 gap-2">
          <Circle className="w-3.5 h-3.5 text-gray-400 shrink-0" />
          <SelectValue>{statusLabel}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL_VALUE}>All Statuses</SelectItem>
          <SelectItem value="pending">Open</SelectItem>
          <SelectItem value="done">Done</SelectItem>
          <SelectItem value="alert">Alert</SelectItem>
        </SelectContent>
      </Select>

      {/* Reset */}
      <Button
        variant="default"
        className="h-9 px-4 rounded-2xl shadow-sm flex items-center gap-2 shrink-0 cursor-pointer active:bg-gray-700 transition-colors"
        onClick={onReset}
      >
        <RotateCcw className="w-3.5 h-3.5" />
        Reset
      </Button>
    </div>
  );
}
