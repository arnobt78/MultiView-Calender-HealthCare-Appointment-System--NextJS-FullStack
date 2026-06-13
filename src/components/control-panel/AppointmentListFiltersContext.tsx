"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { FullAppointment } from "@/hooks/useAppointments";
import type { PatientCareTierFilter } from "@/components/control-panel/PatientListFiltersContext";

export type AppointmentStatusFilter = "all" | "pending" | "done" | "alert" | "cancelled";

export type AppointmentDoctorFilter = "all" | string;

export type AppointmentCategoryFilter = "all" | string;

type Ctx = {
  status: AppointmentStatusFilter;
  setStatus: (s: AppointmentStatusFilter) => void;
  doctorId: AppointmentDoctorFilter;
  setDoctorId: (id: AppointmentDoctorFilter) => void;
  categoryId: AppointmentCategoryFilter;
  setCategoryId: (id: AppointmentCategoryFilter) => void;
  careTier: PatientCareTierFilter;
  setCareTier: (t: PatientCareTierFilter) => void;
  applyToolbarFilters: (list: FullAppointment[]) => FullAppointment[];
};

const AppointmentListFiltersContext = createContext<Ctx | null>(null);

function resolveAppointmentStatus(appt: FullAppointment): string {
  return appt.status ?? "pending";
}

export function AppointmentListFiltersProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AppointmentStatusFilter>("all");
  const [doctorId, setDoctorId] = useState<AppointmentDoctorFilter>("all");
  const [categoryId, setCategoryId] = useState<AppointmentCategoryFilter>("all");
  const [careTier, setCareTier] = useState<PatientCareTierFilter>("all");

  const applyToolbarFilters = useCallback(
    (list: FullAppointment[]) => {
      let out = list;
      if (status !== "all") {
        out = out.filter((a) => resolveAppointmentStatus(a) === status);
      }
      if (doctorId !== "all") {
        out = out.filter((a) => a.treating_physician_id === doctorId);
      }
      if (categoryId !== "all") {
        out = out.filter((a) => a.category === categoryId);
      }
      if (careTier !== "all") {
        if (careTier === "unset") {
          out = out.filter((a) => {
            const cl = a.patient_data?.care_level;
            return (
              cl == null ||
              Number.isNaN(Number(cl)) ||
              cl < 1 ||
              cl > 10
            );
          });
        } else {
          const n = Number(careTier);
          out = out.filter((a) => a.patient_data?.care_level === n);
        }
      }
      return out;
    },
    [status, doctorId, categoryId, careTier]
  );

  const value = useMemo(
    () => ({
      status,
      setStatus,
      doctorId,
      setDoctorId,
      categoryId,
      setCategoryId,
      careTier,
      setCareTier,
      applyToolbarFilters,
    }),
    [status, doctorId, categoryId, careTier, applyToolbarFilters]
  );

  return (
    <AppointmentListFiltersContext.Provider value={value}>
      {children}
    </AppointmentListFiltersContext.Provider>
  );
}

export function useAppointmentListFilters() {
  const ctx = useContext(AppointmentListFiltersContext);
  if (!ctx) {
    throw new Error("useAppointmentListFilters requires AppointmentListFiltersProvider");
  }
  return ctx;
}
