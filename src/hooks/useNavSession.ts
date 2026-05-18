"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { queryKeys } from "@/lib/query-keys";
import { isAdminRole, isDoctorRole, isPatientRole } from "@/lib/rbac";
import type { UUID } from "@/types/types";

type NavUser = {
  id: UUID;
  email: string;
  role?: string;
  display_name?: string;
  image?: string | null;
} | null;

/**
 * Navbar role resolution — prefers live `useAuth` user, falls back to persisted `queryKeys.auth.me`
 * so link chrome does not flicker on refresh before `/api/auth/me` returns.
 */
export function useNavSession() {
  const { user, isLoading: authLoading } = useAuth();
  const queryClient = useQueryClient();
  const cachedUser = queryClient.getQueryData<NavUser>(queryKeys.auth.me);
  const effectiveUser = user ?? cachedUser ?? null;
  const navLoading = authLoading && effectiveUser == null;

  const role = effectiveUser?.role;
  const isAdmin = isAdminRole(role);
  const isDoctor = isDoctorRole(role);
  const isPatient = isPatientRole(role);
  const isStaff = isAdmin || isDoctor;

  return {
    effectiveUser,
    navLoading,
    isAdmin,
    isDoctor,
    isPatient,
    isStaff,
    showAdminPortalLink: navLoading ? false : isAdmin,
    showDoctorPortalLink: navLoading ? false : isDoctor,
    showControlPanelLink: navLoading ? false : isAdmin,
    showStaffNavLinks: navLoading ? false : isStaff,
    showPatientPortalNavLink: navLoading ? false : isPatient,
  };
}
