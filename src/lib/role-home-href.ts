/**
 * Role-aware default landing paths — login, proxy `/home`, and demo flows.
 * Patients/doctors always use their portal; staff honor `?redirect=` when present.
 */

export function resolveRoleHomeHref(
  role: string | null | undefined,
  redirectParam?: string | null
): string {
  if (role === "patient") return "/patient-portal";
  if (role === "doctor") return "/doctor-portal";
  const trimmed = redirectParam?.trim();
  if (trimmed) return trimmed;
  if (role === "admin") return "/control-panel/dashboard-overview";
  return "/dashboard";
}
