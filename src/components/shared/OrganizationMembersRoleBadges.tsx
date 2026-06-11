"use client";

import { ShieldCheck, Stethoscope, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { OrganizationMembersByRole } from "@/lib/organization-list-enrich";
import {
  clinicalBadgeInlineClass,
  clinicalBadgeInlineIconClass,
  clinicalCellMutedTextClass,
} from "@/lib/table-display-styles";
import { cn } from "@/lib/utils";

const ROLE_CHIP = {
  admin: {
    label: "Admin",
    icon: ShieldCheck,
    styles: "border-indigo-300/70 bg-indigo-50 text-indigo-700 shadow-[0_4px_14px_-4px_rgba(99,102,241,0.35)]",
  },
  doctor: {
    label: "Dr",
    icon: Stethoscope,
    styles: "border-emerald-300/70 bg-emerald-50 text-emerald-700 shadow-[0_4px_14px_-4px_rgba(16,185,129,0.35)]",
  },
  patient: {
    label: "Pt",
    icon: User,
    styles: "border-sky-300/70 bg-sky-50 text-sky-700 shadow-[0_4px_14px_-4px_rgba(14,165,233,0.35)]",
  },
} as const;

type RoleKey = keyof typeof ROLE_CHIP;

function OrganizationRoleCountBadge({ role, count }: { role: RoleKey; count: number }) {
  const entry = ROLE_CHIP[role];
  const Icon = entry.icon;
  return (
    <Badge
      variant="outline"
      className={cn(clinicalBadgeInlineClass, entry.styles)}
      title={`${count} ${entry.label}`}
    >
      <Icon className={clinicalBadgeInlineIconClass} aria-hidden />
      {count} {entry.label}
    </Badge>
  );
}

/** Members column — glass role count chips + portal-member helper (not clinical Patient rows). */
export function OrganizationMembersRoleBadges({
  membersByRole,
  className,
}: {
  membersByRole: OrganizationMembersByRole;
  className?: string;
}) {
  return (
    <div className={cn("space-y-1", className)}>
      <div className="flex min-h-[2.75rem] flex-wrap items-center gap-1">
        {(Object.keys(ROLE_CHIP) as RoleKey[]).map((role) => (
          <OrganizationRoleCountBadge key={role} role={role} count={membersByRole[role]} />
        ))}
      </div>
      <p className={clinicalCellMutedTextClass}>Portal patient members — not clinical roster count</p>
    </div>
  );
}
