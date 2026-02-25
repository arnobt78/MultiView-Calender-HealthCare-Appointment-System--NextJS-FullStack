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
};

const ALL_VALUE = "__all__";

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
}: FiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Select
        value={category ?? ALL_VALUE}
        onValueChange={(v) => setCategory(v === ALL_VALUE ? null : v)}
      >
        <SelectTrigger className="w-[140px] rounded-md shadow-xl">
          <SelectValue placeholder="Category" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL_VALUE}>Category</SelectItem>
          {categories.map((c) => (
            <SelectItem key={c.id} value={c.id}>
              {c.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={patient ?? ALL_VALUE}
        onValueChange={(v) => setPatient(v === ALL_VALUE ? null : v)}
      >
        <SelectTrigger className="w-[160px] min-w-[140px] rounded-md shadow-xl">
          <SelectValue placeholder="Client" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL_VALUE}>Client</SelectItem>
          {patients.map((p) => (
            <SelectItem key={p.id} value={p.id}>
              {p.firstname} {p.lastname}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Input
        type="date"
        className="w-[140px] rounded-md shadow-xl"
        value={date ?? ""}
        onChange={(e) => setDate(e.target.value || null)}
      />

      <Select
        value={status ?? ALL_VALUE}
        onValueChange={(v) => setStatus(v === ALL_VALUE ? null : v)}
      >
        <SelectTrigger className="w-[120px] rounded-md shadow-xl">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL_VALUE}>Status</SelectItem>
          <SelectItem value="pending">Open</SelectItem>
          <SelectItem value="done">Done</SelectItem>
          <SelectItem value="alert">Alert</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
