"use client";

import type { OrganizationMembersByRole } from "@/lib/organization-list-enrich";
import { cn } from "@/lib/utils";

/** Display order — all roles shown (including zero) for billing-style parity. */
export const ORGANIZATION_MEMBERS_ROLE_INLINE_ORDER = [
  "admin",
  "doctor",
  "patient",
] as const satisfies readonly (keyof OrganizationMembersByRole)[];

const ROLE_LABEL: Record<keyof OrganizationMembersByRole, string> = {
  admin: "Admin",
  doctor: "Doctor",
  patient: "Patient",
};

const ROLE_TEXT_CLASS: Record<keyof OrganizationMembersByRole, string> = {
  admin: "text-indigo-700",
  doctor: "text-emerald-700",
  patient: "text-sky-700",
};

/** Screen-reader label for inline role count row. */
export function buildOrganizationMembersRoleCountAriaLabel(
  counts: OrganizationMembersByRole
): string {
  return ORGANIZATION_MEMBERS_ROLE_INLINE_ORDER.map(
    (key) => `${ROLE_LABEL[key]}: ${counts[key]}`
  ).join(", ");
}

type Props = {
  counts: OrganizationMembersByRole;
  className?: string;
};

/** Org members header — colored Admin/Doctor/Patient segments with · separators (billing parity). */
export function OrganizationMembersRoleCountInlineRow({ counts, className }: Props) {
  return (
    <span
      className={cn("inline-flex min-w-0 flex-wrap items-center gap-x-1 text-xs", className)}
      aria-label={buildOrganizationMembersRoleCountAriaLabel(counts)}
    >
      {ORGANIZATION_MEMBERS_ROLE_INLINE_ORDER.map((key, index) => (
        <span key={key} className="inline-flex items-center gap-x-1">
          {index > 0 ? (
            <span className="text-muted-foreground/70" aria-hidden>
              ·
            </span>
          ) : null}
          <span className={cn("font-medium tabular-nums", ROLE_TEXT_CLASS[key])}>
            {ROLE_LABEL[key]}: {counts[key]}
          </span>
        </span>
      ))}
    </span>
  );
}
