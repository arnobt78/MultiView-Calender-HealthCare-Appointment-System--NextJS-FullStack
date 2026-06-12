"use client";

import { Users } from "lucide-react";
import { PortalPanelSubsectionHeader } from "@/components/shared/PortalPanelSubsectionHeader";
import { OrganizationMembersRoleCountInlineRow } from "@/components/shared/organization/OrganizationMembersRoleCountInlineRow";
import type { OrganizationMembersByRole } from "@/lib/organization-list-enrich";
import {
  ORGANIZATION_MEMBERS_SUBTITLE,
  organizationMembersSectionTitle,
} from "@/lib/organization-members-display";

/** Tall indigo tile + inline title · count · role breakdown — matches Related Billing header. */
export const organizationDetailMembersPanelIconClass =
  "border-indigo-100 bg-indigo-50 [&_svg]:text-indigo-600";

/** "{Org}'s Members" + count pill + Admin/Doctor/Patient inline row + subtitle. */
export function OrganizationDetailMembersSectionHeading({
  orgName,
  totalCount,
  membersByRole,
}: {
  orgName: string;
  totalCount: number;
  membersByRole: OrganizationMembersByRole;
}) {
  return (
    <PortalPanelSubsectionHeader
      id="org-members-heading"
      title={organizationMembersSectionTitle(orgName)}
      subtitle={ORGANIZATION_MEMBERS_SUBTITLE}
      icon={Users}
      iconClassName={organizationDetailMembersPanelIconClass}
      count={totalCount}
      statusChip={<OrganizationMembersRoleCountInlineRow counts={membersByRole} />}
    />
  );
}
