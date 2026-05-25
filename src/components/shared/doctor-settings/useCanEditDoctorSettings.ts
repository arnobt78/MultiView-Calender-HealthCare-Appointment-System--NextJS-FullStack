"use client";

import { useAuth } from "@/hooks/useAuth";

/** Admin or the profile doctor may edit schedule + visit-type settings (API enforces same rule). */
export function useCanEditDoctorSettings(doctorId: string): boolean {
  const { user } = useAuth();
  return user?.role === "admin" || user?.id === doctorId;
}
