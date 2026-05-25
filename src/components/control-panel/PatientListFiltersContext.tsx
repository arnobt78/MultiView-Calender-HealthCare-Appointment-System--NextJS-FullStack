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

/** Exact tier 1–10, `unset` = no documented tier, `all` = no filter */
export type PatientCareTierFilter =
  | "all"
  | "unset"
  | "1"
  | "2"
  | "3"
  | "4"
  | "5"
  | "6"
  | "7"
  | "8"
  | "9"
  | "10";

/** `all` or primary-care doctor user id */
export type PatientPrimaryDoctorFilter = "all" | string;

type Ctx = {
  status: PatientStatusFilter;
  setStatus: (s: PatientStatusFilter) => void;
  careTier: PatientCareTierFilter;
  setCareTier: (t: PatientCareTierFilter) => void;
  primaryDoctorId: PatientPrimaryDoctorFilter;
  setPrimaryDoctorId: (id: PatientPrimaryDoctorFilter) => void;
  /** When true (doctor portal), primary-doctor dropdown is hidden and filter stays locked. */
  lockPrimaryDoctor: boolean;
  /** Toolbar filters — applied before DataTable global search (status + care tier + primary doctor) */
  filterByStatus: (list: Patient[]) => Patient[];
};

const PatientListFiltersContext = createContext<Ctx | null>(null);

type PatientListFiltersProviderProps = {
  children: ReactNode;
  /** Initial primary doctor filter — doctor portal passes session doctor id. */
  initialPrimaryDoctorId?: PatientPrimaryDoctorFilter;
  /** Locks `primaryDoctorId` and ignores `setPrimaryDoctorId` (doctor portal roster). */
  lockPrimaryDoctor?: boolean;
};

export function PatientListFiltersProvider({
  children,
  initialPrimaryDoctorId = "all",
  lockPrimaryDoctor = false,
}: PatientListFiltersProviderProps) {
  const [status, setStatus] = useState<PatientStatusFilter>("all");
  const [careTier, setCareTier] = useState<PatientCareTierFilter>("all");
  const [primaryDoctorId, setPrimaryDoctorIdState] =
    useState<PatientPrimaryDoctorFilter>(initialPrimaryDoctorId);

  const setPrimaryDoctorId = useCallback(
    (id: PatientPrimaryDoctorFilter) => {
      if (lockPrimaryDoctor) return;
      setPrimaryDoctorIdState(id);
    },
    [lockPrimaryDoctor]
  );

  const filterByStatus = useCallback(
    (list: Patient[]) => {
      let out = list;
      if (status === "active") out = out.filter((p) => p.active);
      else if (status === "inactive") out = out.filter((p) => !p.active);
      if (careTier !== "all") {
        if (careTier === "unset") {
          out = out.filter(
            (p) =>
              p.care_level == null ||
              Number.isNaN(Number(p.care_level)) ||
              p.care_level < 1 ||
              p.care_level > 10
          );
        } else {
          const n = Number(careTier);
          out = out.filter((p) => p.care_level === n);
        }
      }
      if (primaryDoctorId !== "all") {
        out = out.filter((p) => p.primary_doctor_id === primaryDoctorId);
      }
      return out;
    },
    [status, careTier, primaryDoctorId]
  );

  const value = useMemo(
    () => ({
      status,
      setStatus,
      careTier,
      setCareTier,
      primaryDoctorId,
      setPrimaryDoctorId,
      lockPrimaryDoctor,
      filterByStatus,
    }),
    [
      status,
      careTier,
      primaryDoctorId,
      setPrimaryDoctorId,
      lockPrimaryDoctor,
      filterByStatus,
    ]
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
