"use client";

import { createContext, useContext, useMemo, useState } from "react";
import type { Patient } from "@/types/types";

export type CalendarFiltersState = {
  category: string | null;
  patient: string | null;
  date: string | null;
  status: string | null;
  month: string | null;
  search: string;
};

type CalendarFiltersContextValue = CalendarFiltersState & {
  setCategory: (v: string | null) => void;
  setPatient: (v: string | null) => void;
  setDate: (v: string | null) => void;
  setStatus: (v: string | null) => void;
  setMonth: (v: string | null) => void;
  setSearch: (v: string) => void;
  resetFilters: () => void;
  hasActiveFilters: boolean;
};

type SearchableAppointment = {
  start: string | Date;
  title?: string | null;
  notes?: string | null;
  location?: string | null;
  status?: string | null;
  category?: string | null;
  patient?: string | Record<string, unknown> | null;
  category_data?: { label?: string | null; description?: string | null };
  patient_data?: { firstname?: string | null; lastname?: string | null; email?: string | null };
  appointment_assignee?: { user?: string | null; invited_email?: string | null }[];
  attachments?: string[];
};

const CalendarFiltersContext = createContext<CalendarFiltersContextValue | null>(
  null
);

export function CalendarFiltersProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [category, setCategory] = useState<string | null>(null);
  const [patient, setPatient] = useState<string | null>(null);
  const [date, setDate] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [month, setMonth] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const resetFilters = () => {
    setCategory(null);
    setPatient(null);
    setDate(null);
    setStatus(null);
    setMonth(null);
    setSearch("");
  };

  const hasActiveFilters = useMemo(
    () =>
      Boolean(
        category || patient || date || status || month || search.trim().length
      ),
    [category, patient, date, status, month, search]
  );

  const value = useMemo(
    () => ({
      category,
      patient,
      date,
      status,
      month,
      search,
      setCategory,
      setPatient,
      setDate,
      setStatus,
      setMonth,
      setSearch,
      resetFilters,
      hasActiveFilters,
    }),
    [category, patient, date, status, month, search, hasActiveFilters]
  );

  return (
    <CalendarFiltersContext.Provider value={value}>
      {children}
    </CalendarFiltersContext.Provider>
  );
}

export function useCalendarFilters() {
  const ctx = useContext(CalendarFiltersContext);
  if (!ctx) {
    throw new Error("useCalendarFilters must be used inside CalendarFiltersProvider");
  }
  return ctx;
}

export function applyCalendarFilters<T extends SearchableAppointment>(
  appointments: T[],
  filters: CalendarFiltersState,
  patients: Patient[] = []
): T[] {
  const { category, patient, date, status, month, search } = filters;
  const lowerSearch = search.trim().toLowerCase();

  return appointments.filter((appt) => {
    const start = new Date(appt.start);

    if (date) {
      const day = new Date(date);
      day.setHours(0, 0, 0, 0);
      const dayStart = new Date(day);
      const dayEnd = new Date(day);
      dayEnd.setHours(23, 59, 59, 999);
      if (start < dayStart || start > dayEnd) return false;
    }

    if (month) {
      const monthValue = `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, "0")}`;
      if (monthValue !== month) return false;
    }

    if (category && appt.category !== category) return false;
    if (patient && appt.patient !== patient) return false;
    if (status && appt.status !== status) return false;

    if (!lowerSearch) return true;

    const match = (val?: string | null) =>
      Boolean(val && val.toLowerCase().includes(lowerSearch));

    const patientMatchFromData =
      match(appt.patient_data?.firstname || "") ||
      match(appt.patient_data?.lastname || "") ||
      match(appt.patient_data?.email || "");

    const patientMatchFromId =
      typeof appt.patient === "string"
        ? patients.some(
          (p) =>
            p.id === appt.patient &&
            (`${p.firstname} ${p.lastname}`.toLowerCase().includes(lowerSearch) ||
              match(p.email))
        )
        : false;

    return (
      match(appt.title || "") ||
      match(appt.notes || "") ||
      match(appt.location || "") ||
      match(appt.status || "") ||
      match(appt.category_data?.label || "") ||
      match(appt.category_data?.description || "") ||
      patientMatchFromData ||
      patientMatchFromId ||
      (appt.appointment_assignee || []).some(
        (a) => match(a.user || "") || match(a.invited_email || "")
      ) ||
      (appt.attachments || []).some((a) => match(a))
    );
  });
}
