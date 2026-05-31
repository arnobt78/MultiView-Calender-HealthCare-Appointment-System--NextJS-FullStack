"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { User } from "@/types/types";
import type { DoctorDirectoryRow } from "@/lib/doctor-directory";
import { isDoctorActive } from "@/lib/entity-active-status";

export type DoctorStatusFilter = "all" | "active" | "inactive";
export type DoctorAvailabilityFilter = "all" | "with" | "without";

type DoctorRow = User & { directory?: DoctorDirectoryRow };

type Ctx = {
  status: DoctorStatusFilter;
  setStatus: (s: DoctorStatusFilter) => void;
  specialty: string;
  setSpecialty: (s: string) => void;
  availability: DoctorAvailabilityFilter;
  setAvailability: (a: DoctorAvailabilityFilter) => void;
  listSearch: string;
  setListSearch: (q: string) => void;
  filterDoctors: (rows: DoctorRow[]) => DoctorRow[];
  hasActiveFilters: boolean;
  resetFilters: () => void;
};

const DoctorListFiltersContext = createContext<Ctx | null>(null);

export function DoctorListFiltersProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<DoctorStatusFilter>("all");
  const [specialty, setSpecialty] = useState("all");
  const [availability, setAvailability] = useState<DoctorAvailabilityFilter>("all");
  const [listSearch, setListSearch] = useState("");

  const filterDoctors = useCallback(
    (rows: DoctorRow[]) => {
      return rows.filter((row) => {
        const d = row.directory;
        if (status === "active" && !isDoctorActive(row)) return false;
        if (status === "inactive" && isDoctorActive(row)) return false;
        if (specialty !== "all" && (d?.specialty ?? row.specialty) !== specialty) return false;
        const availCount = d?.availabilities?.length ?? 0;
        if (availability === "with" && availCount === 0) return false;
        if (availability === "without" && availCount > 0) return false;
        return true;
      });
    },
    [status, specialty, availability]
  );

  const hasActiveFilters =
    status !== "all" || specialty !== "all" || availability !== "all" || listSearch.trim().length > 0;

  const resetFilters = useCallback(() => {
    setStatus("all");
    setSpecialty("all");
    setAvailability("all");
    setListSearch("");
  }, []);

  const value = useMemo(
    () => ({
      status,
      setStatus,
      specialty,
      setSpecialty,
      availability,
      setAvailability,
      listSearch,
      setListSearch,
      filterDoctors,
      hasActiveFilters,
      resetFilters,
    }),
    [
      status,
      specialty,
      availability,
      listSearch,
      filterDoctors,
      hasActiveFilters,
      resetFilters,
    ]
  );

  return (
    <DoctorListFiltersContext.Provider value={value}>{children}</DoctorListFiltersContext.Provider>
  );
}

export function useDoctorListFilters() {
  const ctx = useContext(DoctorListFiltersContext);
  if (!ctx) {
    throw new Error("useDoctorListFilters requires DoctorListFiltersProvider");
  }
  return ctx;
}
