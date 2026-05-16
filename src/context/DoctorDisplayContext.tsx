"use client";

/**
 * Static helpers for doctor specialty badges and avatars — no data fetching.
 * Consumers still use TanStack Query (`queryKeys.doctors.all`, `useUsers`) for lists.
 */

import { createContext, useContext, useMemo, type ReactNode } from "react";
import {
  getSpecialtyGlassClassName,
  getSpecialtyGlassVariant,
  SPECIALTIES,
  type SpecialtyGlassVariant,
} from "@/lib/doctor-specialty";
import { getDoctorAvatarSrc, type DoctorAvatarInput } from "@/lib/doctor-avatar";

export type DoctorDisplayContextValue = {
  specialties: readonly string[];
  getSpecialtyGlassVariant: (specialty: string | null | undefined) => SpecialtyGlassVariant;
  getSpecialtyGlassClassName: (specialty: string | null | undefined) => string;
  getDoctorAvatarSrc: (doctor: DoctorAvatarInput) => string;
};

const DoctorDisplayContext = createContext<DoctorDisplayContextValue | null>(null);

export function DoctorDisplayProvider({ children }: { children: ReactNode }) {
  const value = useMemo<DoctorDisplayContextValue>(
    () => ({
      specialties: SPECIALTIES,
      getSpecialtyGlassVariant,
      getSpecialtyGlassClassName,
      getDoctorAvatarSrc,
    }),
    []
  );

  return (
    <DoctorDisplayContext.Provider value={value}>{children}</DoctorDisplayContext.Provider>
  );
}

export function useDoctorDisplay(): DoctorDisplayContextValue {
  const ctx = useContext(DoctorDisplayContext);
  if (!ctx) {
    throw new Error("useDoctorDisplay must be used within DoctorDisplayProvider");
  }
  return ctx;
}

/** Optional hook for components that may render outside provider (returns lib fallbacks). */
export function useDoctorDisplayOptional(): DoctorDisplayContextValue {
  const ctx = useContext(DoctorDisplayContext);
  return (
    ctx ?? {
      specialties: SPECIALTIES,
      getSpecialtyGlassVariant,
      getSpecialtyGlassClassName,
      getDoctorAvatarSrc,
    }
  );
}
