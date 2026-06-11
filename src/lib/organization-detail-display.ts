import type { OrganizationDetailMemberRow } from "@/lib/organization-detail-members-columns";
import type { OrganizationMembersByRole } from "@/lib/organization-list-enrich";
import { toTitleCaseLabel } from "@/lib/utils";

/** Human label for org_type — "clinic" → "Clinic", "private_practice" → "Private Practice". */
export function formatOrganizationTypeLabel(orgType: string | null | undefined): string | null {
  const raw = orgType?.trim();
  if (!raw) return null;
  if (raw.includes("_")) {
    return raw
      .split("_")
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
      .join(" ");
  }
  return toTitleCaseLabel(raw.charAt(0).toUpperCase() + raw.slice(1));
}

/** Role counts for members section heading chips. */
export function countOrganizationMembersByRole(
  members: Pick<OrganizationDetailMemberRow, "role">[]
): OrganizationMembersByRole {
  const counts: OrganizationMembersByRole = { admin: 0, doctor: 0, patient: 0 };
  for (const m of members) {
    const role = m.role as keyof OrganizationMembersByRole;
    if (role in counts) counts[role] += 1;
  }
  return counts;
}
