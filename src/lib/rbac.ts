import { prisma } from "@/lib/prisma";

/**
 * Role predicate helpers.
 * Use these throughout API routes and server layouts instead of inline string comparisons
 * so that renaming a role value only requires a change here.
 */

/** Patient accounts use portal flows; control-panel CRUD is blocked at the API/layout layer. */
export function isPatientRole(role: string | null | undefined): boolean {
  return role === "patient";
}

/** Admin accounts have full access to all resources and user management. */
export function isAdminRole(role: string | null | undefined): boolean {
  return role === "admin";
}

/** Doctor accounts can manage patients and appointments; cannot manage system settings. */
export function isDoctorRole(role: string | null | undefined): boolean {
  return role === "doctor";
}

/**
 * Staff = admin | doctor.
 * Explicitly enumerated so null/undefined/"unknown" roles are never treated as staff,
 * which would open RBAC bypass vectors via !isPatientRole(null) → true.
 */
export function isStaffRole(role: string | null | undefined): boolean {
  return role === "admin" || role === "doctor";
}

/**
 * Resolve the role string for a given user from the database.
 * Result is cached per-request by Prisma connection pooling.
 */
export async function getUserRole(userId: string): Promise<string | null> {
  const u = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });
  return u?.role ?? null;
}
