"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Patient } from "@/types/types";

export type PatientStatusFilter = "all" | "active" | "inactive";

type Ctx = {
  status: PatientStatusFilter;
  setStatus: (s: PatientStatusFilter) => void;
  /** Toolbar filter — applied before DataTable global search */
  filterByStatus: (list: Patient[]) => Patient[];
};

const PatientListFiltersContext = createContext<Ctx | null>(null);

export function PatientListFiltersProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<PatientStatusFilter>("all");

  const filterByStatus = useCallback(
    (list: Patient[]) => {
      if (status === "active") return list.filter((p) => p.active);
      if (status === "inactive") return list.filter((p) => !p.active);
      return list;
    },
    [status]
  );

  const value = useMemo(
    () => ({ status, setStatus, filterByStatus }),
    [status, filterByStatus]
  );

  return (
    <PatientListFiltersContext.Provider value={value}>{children}</PatientListFiltersContext.Provider>
  );
}

export function usePatientListFilters() {
  const ctx = useContext(PatientListFiltersContext);
  if (!ctx) {
    throw new Error("usePatientListFilters requires PatientListFiltersProvider");
  }
  return ctx;
}
