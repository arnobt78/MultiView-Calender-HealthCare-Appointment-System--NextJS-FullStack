"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useInitialNavRole } from "@/context/NavRoleContext";
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
 * Navbar role resolution — `useInitialNavRole()` (SSR) + `useAuth` / query cache (client).
 * Role links stay visible when `role` is known; never read localStorage during render (hydration-safe).
 */
export function useNavSession() {
  const { user, isLoading: authLoading } = useAuth();
  const queryClient = useQueryClient();
  const initialNavRole = useInitialNavRole();
  const cachedUser = queryClient.getQueryData<NavUser>(queryKeys.auth.me);

  const role = user?.role ?? cachedUser?.role ?? initialNavRole ?? undefined;
  const effectiveUser: NavUser =
    user ?? cachedUser ?? (role ? { id: "" as UUID, email: "", role } : null);
  const navLoading = authLoading && role == null;

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
    showAdminPortalLink: isAdmin,
    showDoctorPortalLink: isDoctor,
    showControlPanelLink: isAdmin,
    showStaffNavLinks: isStaff,
    showPatientPortalNavLink: isPatient,
  };
}
