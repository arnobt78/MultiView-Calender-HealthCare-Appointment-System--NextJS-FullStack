/**
 * Mirrors GET /api/users RBAC — keeps client prefetch/fetch aligned with the API (no 403 noise).
 */

import type { UserListFilters } from "@/hooks/useUsers";
import { isPatientRole } from "@/lib/rbac";

/** Patients may only list doctors (booking + directory). Staff may list any role filter. */
export function canClientFetchUsersList(
  callerRole: string | null | undefined,
  filters: UserListFilters
): boolean {
  if (!callerRole || !isPatientRole(callerRole)) return true;

  const roleParam = filters.role;
  const rolesParam = filters.roles ?? [];
  const isDoctorOnlyQuery =
    (roleParam === "doctor" && rolesParam.length === 0) ||
    (!roleParam && rolesParam.length === 1 && rolesParam[0] === "doctor");
  return isDoctorOnlyQuery;
}

/** Admin roster on detail screens — staff-only (snapshot rows use denormalized names for patients). */
export function canClientFetchAdminUsersList(callerRole: string | null | undefined): boolean {
  return !!callerRole && !isPatientRole(callerRole);
}
