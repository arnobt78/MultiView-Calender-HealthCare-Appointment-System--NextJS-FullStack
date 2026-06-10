/**
 * SSR: Organization detail page — all schema properties.
 * Server-fetches org + members; client screen handles chrome + glass layout.
 */
export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { serializeOrganization } from "@/lib/serializers";
import { isValidUUID } from "@/lib/validation";
import {
  OrganizationDetailScreen,
  type OrganizationDetailMemberRow,
} from "@/components/control-panel/OrganizationDetailScreen";

type PageProps = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  return { title: `Organization — ${id.slice(0, 8)}` };
}

export default async function OrganizationDetailPage({ params }: PageProps) {
  const { id } = await params;
  if (!isValidUUID(id)) notFound();

  const sessionUser = await getSessionUser();
  if (!sessionUser) notFound();

  const raw = await prisma.organization.findFirst({
    where: {
      id,
      OR: [
        { owner_user_id: sessionUser.userId },
        { members: { some: { user_id: sessionUser.userId } } },
      ],
    },
    include: { members: true },
  });
  if (!raw) notFound();

  const orgSerialized = serializeOrganization(raw);
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

  return (
    <OrganizationDetailScreen
      org={{
        ...orgSerialized,
        owner_label:
          ownerUser?.display_name ?? ownerUser?.email ?? orgSerialized.owner_user_id,
      }}
      members={members}
    />
  );
}
