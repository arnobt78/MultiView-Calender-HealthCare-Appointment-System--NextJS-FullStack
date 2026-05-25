"use client";

import { useAuth } from "@/hooks/useAuth";

type Options = {
  /** Doctor portal is doctor-only at the edge — skip auth hydration gap on refresh. */
  portalSelfService?: boolean;
};

/** Admin or the profile doctor may edit schedule + visit-type settings (API enforces same rule). */
export function useCanEditDoctorSettings(doctorId: string, options?: Options): boolean {
  const { user } = useAuth();
  if (options?.portalSelfService) return true;
  return user?.role === "admin" || user?.id === doctorId;
}
