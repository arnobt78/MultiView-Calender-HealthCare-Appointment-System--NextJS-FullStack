"use client";

import { Users } from "lucide-react";
import { EntityDetailSnapshotSectionHeading } from "@/components/shared/entity-detail/EntityDetailSnapshotSectionHeading";
import { entityDetailOwnedSnapshotSectionTitle } from "@/lib/entity-detail-snapshot-section-copy";
import type { OrganizationMembersByRole } from "@/lib/organization-list-enrich";
import {
  organizationDetailSectionIconCircleClass,
  organizationDetailSectionIconClass,
} from "@/lib/organization-detail-ui-classes";
import { cn } from "@/lib/utils";

const ROLE_SUMMARY = {
  admin: { label: "Admin", className: "text-indigo-700" },
  doctor: { label: "Doctor", className: "text-emerald-700" },
  patient: { label: "Patient", className: "text-sky-700" },
} as const;

/** "{Org}'s Members" + total badge + role count summary (Admin 1 · Doctor 8 · …). */
export function OrganizationDetailMembersSectionHeading({
  orgName,
  totalCount,
  membersByRole,
}: {
  orgName: string;
  totalCount: number;
  membersByRole: OrganizationMembersByRole;
}) {
  const title = entityDetailOwnedSnapshotSectionTitle(orgName, "members", "organization");
  const parts = (Object.keys(ROLE_SUMMARY) as (keyof typeof ROLE_SUMMARY)[])
    .filter((role) => membersByRole[role] > 0)
    .map((role) => ({
      key: role,
      text: `${ROLE_SUMMARY[role].label} ${membersByRole[role]}`,
      className: ROLE_SUMMARY[role].className,
    }));

  return (
    <div className="space-y-1">
      <EntityDetailSnapshotSectionHeading
        icon={Users}
        sectionIconCircleClass={organizationDetailSectionIconCircleClass}
        iconClassName={organizationDetailSectionIconClass}
        count={totalCount}
      >
        {title}
      </EntityDetailSnapshotSectionHeading>
      {parts.length > 0 ? (
        <p className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 pl-8 text-xs text-muted-foreground">
          {parts.map((part, index) => (
            <span key={part.key} className="inline-flex items-center gap-1.5">
              {index > 0 ? <span aria-hidden>·</span> : null}
              <span className={cn("font-medium", part.className)}>{part.text}</span>
            </span>
          ))}
        </p>
      ) : null}
    </div>
  );
}
