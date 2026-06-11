/**
 * SSR organization detail loader — shared by detail page, server prefetch, and GET API.
 * Keeps Prisma + member enrichment in one place (patient/category detail parity).
 */

import { prisma } from "@/lib/prisma";
import { serializeOrganization } from "@/lib/serializers";
import type { OrganizationDetailMemberRow } from "@/lib/organization-detail-members-columns";

/** Org detail chrome — schema fields + owner label + viewer role for CRUD gates. */
export type OrganizationDetailOrg = {
  id: string;
  created_at: string;
  name: string;
  slug: string;
  owner_user_id: string;
  owner_label: string;
  description?: string | null;
  website?: string | null;
  address?: string | null;
  phone?: string | null;
  timezone?: string | null;
  logo_url?: string | null;
  org_type?: string | null;
  /** Current viewer's role in this org — admin can manage. */
  viewer_role?: string;
};

export type OrganizationDetailPayload = {
  org: OrganizationDetailOrg;
  members: OrganizationDetailMemberRow[];
};

/** Load org + enriched members when caller is owner or member — null when forbidden/missing. */
export async function loadOrganizationDetailForUser(
  orgId: string,
  userId: string
): Promise<OrganizationDetailPayload | null> {
  const raw = await prisma.organization.findFirst({
    where: {
      id: orgId,
      OR: [
        { owner_user_id: userId },
        { members: { some: { user_id: userId } } },
      ],
    },
    include: { members: true },
  });
  if (!raw) return null;

  const orgSerialized = serializeOrganization(raw);
  const viewerMembership = raw.members.find((m) => m.user_id === userId);
  const userIds = raw.members.map((m) => m.user_id).filter(Boolean);
  const users =
    userIds.length > 0
      ? await prisma.user.findMany({
          where: { id: { in: userIds } },
          select: { id: true, email: true, display_name: true },
        })
      : [];
  const userMap = Object.fromEntries(users.map((u) => [u.id, u]));
  const ownerUser = userMap[orgSerialized.owner_user_id];

  const members: OrganizationDetailMemberRow[] = raw.members.map((m) => {
    const u = userMap[m.user_id];
    return {
      id: m.id,
      org_id: m.org_id,
      user_id: m.user_id,
      role: m.role,
      joined_at: m.joined_at.toISOString(),
      display_name: u?.display_name ?? null,
      email: u?.email ?? null,
    };
  });

  return {
    org: {
      ...orgSerialized,
      owner_label:
        ownerUser?.display_name ?? ownerUser?.email ?? orgSerialized.owner_user_id,
      viewer_role:
        raw.owner_user_id === userId ? "admin" : viewerMembership?.role ?? undefined,
    },
    members,
  };
}
