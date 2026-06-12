/**
 * Client-side org detail members filters — mirrors billing invoice filter pattern (no API).
 */

import type { OrganizationDetailMemberRow } from "@/lib/organization-detail-members-columns";
import type { OrgMemberRole } from "@/lib/organization-member-role";

export type OrganizationDetailMemberRoleFilter = "all" | OrgMemberRole;

/** Display label for members table — patient clinical name when present. */
export function organizationDetailMemberDisplayName(
  member: OrganizationDetailMemberRow
): string {
  if (member.role === "patient" && (member.patient_firstname || member.patient_lastname)) {
    return `${member.patient_firstname ?? ""} ${member.patient_lastname ?? ""}`.trim();
  }
  return member.display_name?.trim() || member.email?.trim() || "Unknown";
}

/** Lowercased search haystack — name, email, role, specialty, patient names, id prefixes. */
export function organizationDetailMemberSearchHaystack(
  member: OrganizationDetailMemberRow
): string {
  const parts = [
    organizationDetailMemberDisplayName(member),
    member.display_name,
    member.email,
    member.role,
    member.specialty,
    member.patient_firstname,
    member.patient_lastname,
    member.id,
    member.user_id,
  ];
  return parts
    .filter((p): p is string => Boolean(p?.trim()))
    .join(" ")
    .toLowerCase();
}

/** Filter members roster by role + free-text search (client-side on SSR-seeded cache). */
export function filterOrganizationDetailMembers(
  members: OrganizationDetailMemberRow[],
  opts: { search: string; role: OrganizationDetailMemberRoleFilter }
): OrganizationDetailMemberRow[] {
  let rows = members;

  if (opts.role !== "all") {
    rows = rows.filter((m) => m.role === opts.role);
  }

  const q = opts.search.trim().toLowerCase();
  if (!q) return rows;

  return rows.filter((m) => organizationDetailMemberSearchHaystack(m).includes(q));
}
