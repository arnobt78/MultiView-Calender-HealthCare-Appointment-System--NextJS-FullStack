/**
 * Role-aware default landing paths — login, proxy `/home`, landing demo, Google OAuth.
 * Patients and doctors always land on their portal (ignore stale `?redirect=/dashboard` from
 * an earlier protected-route visit). Admins honor safe redirect; everyone else → dashboard.
 */

function normalizeLoginRole(role: string | null | undefined): string | null {
  const trimmed = role?.trim();
  if (!trimmed) return null;
  const lower = trimmed.toLowerCase();
  if (lower === "patient" || lower === "doctor" || lower === "admin") return lower;
  return trimmed;
}

export function resolveRoleHomeHref(
  role: string | null | undefined,
  redirectParam?: string | null
): string {
  const r = normalizeLoginRole(role);
  if (r === "patient") return "/patient-portal";
  if (r === "doctor") return "/doctor-portal";
  const trimmed = redirectParam?.trim();
  if (trimmed) return trimmed;
  if (r === "admin") return "/control-panel/dashboard-overview";
  return "/dashboard";
}
