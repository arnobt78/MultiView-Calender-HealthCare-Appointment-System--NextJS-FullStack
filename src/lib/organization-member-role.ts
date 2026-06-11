/**
 * Organization member role helpers — org portal roles map 1:1 from user roles when possible.
 */

import type { LucideIcon } from "lucide-react";
import { ShieldCheck, Stethoscope, User } from "lucide-react";

export type OrgMemberRole = "admin" | "doctor" | "patient";

export const ORG_MEMBER_ROLES: readonly OrgMemberRole[] = [
  "admin",
  "doctor",
  "patient",
] as const;

export type OrgMemberRoleOption = {
  value: OrgMemberRole;
  label: string;
  description: string;
  icon: LucideIcon;
};

/** Rich role picker rows — icon + label aligned with UserRoleBadge semantics. */
export const ORG_MEMBER_ROLE_OPTIONS: readonly OrgMemberRoleOption[] = [
  {
    value: "admin",
    label: "Admin",
    description: "Manage members, billing, and org settings.",
    icon: ShieldCheck,
  },
  {
    value: "doctor",
    label: "Doctor",
    description: "Clinical staff linked to org visits and billing.",
    icon: Stethoscope,
  },
  {
    value: "patient",
    label: "Patient",
    description: "Portal patient member — not clinical roster count.",
    icon: User,
  },
] as const;

/** Map platform user.role → org member role (overridable in add-member UI). */
export function mapUserRoleToOrgMemberRole(
  userRole: string | null | undefined
): OrgMemberRole {
  const normalized = (userRole ?? "").toLowerCase();
  if (normalized === "admin") return "admin";
  if (normalized === "patient") return "patient";
  if (normalized === "doctor") return "doctor";
  // Unknown roles default to doctor for org membership assignment.
  return "doctor";
}

export function isOrgMemberRole(value: string): value is OrgMemberRole {
  return ORG_MEMBER_ROLES.includes(value as OrgMemberRole);
}

export type InitialOrgMemberInput = {
  userId: string;
  role: OrgMemberRole;
};

/**
 * Dedupe initial members for POST /api/organizations — skips creator (already admin)
 * and duplicate userIds (last wins by role slot order).
 */
export function dedupeInitialMembers(
  members: ReadonlyArray<InitialOrgMemberInput>,
  creatorUserId: string
): InitialOrgMemberInput[] {
  const seen = new Set<string>([creatorUserId]);
  const result: InitialOrgMemberInput[] = [];
  for (const entry of members) {
    const userId = entry.userId?.trim();
    if (!userId || seen.has(userId) || !isOrgMemberRole(entry.role)) continue;
    seen.add(userId);
    result.push({ userId, role: entry.role });
  }
  return result;
}

/** Build initialMembers payload from create-org form optional picker ids. */
export function buildInitialMembersFromFormSlots(slots: {
  initialAdminId?: string;
  initialDoctorId?: string;
  initialPatientId?: string;
}): InitialOrgMemberInput[] {
  const members: InitialOrgMemberInput[] = [];
  if (slots.initialAdminId?.trim()) {
    members.push({ userId: slots.initialAdminId.trim(), role: "admin" });
  }
  if (slots.initialDoctorId?.trim()) {
    members.push({ userId: slots.initialDoctorId.trim(), role: "doctor" });
  }
  if (slots.initialPatientId?.trim()) {
    members.push({ userId: slots.initialPatientId.trim(), role: "patient" });
  }
  return members;
}
