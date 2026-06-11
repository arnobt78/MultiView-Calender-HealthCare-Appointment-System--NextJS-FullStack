/**
 * SSR organization detail loader — shared by detail page, server prefetch, and GET API.
 * Keeps Prisma + member enrichment in one place (patient/category detail parity).
 */

import { prisma } from "@/lib/prisma";
import { organizationDetailInclude } from "@/lib/organization-api-include";
import type { EntityDetailAuditActor } from "@/lib/entity-detail-audit-actor";
import { mapEntityDetailAuditActor } from "@/lib/entity-detail-audit-actor";
import { serializeOrganization } from "@/lib/serializers";
import type { OrganizationDetailMemberRow } from "@/lib/organization-detail-members-columns";

/** Org detail chrome — schema fields + owner actor + viewer role for CRUD gates. */
export type OrganizationDetailOrg = {
  id: string;
  created_at: string;
  updated_at?: string | null;
  name: string;
  slug: string;
  owner_user_id: string;
  owner_label: string;
  owner: EntityDetailAuditActor | null;
  description?: string | null;
  website?: string | null;
  address?: string | null;
  phone?: string | null;
  timezone?: string | null;
  logo_url?: string | null;
  org_type?: string | null;
  /** Denormalized audit — Record Audit card (serializeOrganization shape). */
  created_by_id?: string | null;
  updated_by_id?: string | null;
  created_by_display?: string | null;
  updated_by_display?: string | null;
  created_by_email?: string | null;
  updated_by_email?: string | null;
  created_by_image?: string | null;
  created_by_role?: string | null;
  updated_by_image?: string | null;
  updated_by_role?: string | null;
  /** Current viewer's role in this org — admin can manage. */
  viewer_role?: string;
};

export type OrganizationDetailPayload = {
  org: OrganizationDetailOrg;
  members: OrganizationDetailMemberRow[];
};

type PrismaOrgMember = {
  id: string;
  org_id: string;
  user_id: string;
  role: string;
  joined_at: Date;
};

type UserEnrichmentPick = {
  id: string;
  email: string;
  display_name: string | null;
  image: string | null;
  role: string | null;
  specialty: string | null;
};

type PatientClinicalPick = {
  id: string;
  email: string | null;
  firstname: string;
  lastname: string;
  birth_date: Date | null;
  care_level: number | null;
};

export type OrganizationMemberEnrichmentMaps = {
  userMap: Record<string, UserEnrichmentPick>;
  patientByEmail: Record<string, PatientClinicalPick>;
};

/** Batch-load users + patient clinical rows for member enrichment. */
export async function loadOrganizationMemberEnrichmentMaps(
  memberRows: PrismaOrgMember[],
  ownerUserId: string
): Promise<OrganizationMemberEnrichmentMaps> {
  const userIds = new Set<string>([ownerUserId]);
  for (const m of memberRows) userIds.add(m.user_id);

  const users =
    userIds.size > 0
      ? await prisma.user.findMany({
          where: { id: { in: [...userIds] } },
          select: {
            id: true,
            email: true,
            display_name: true,
            image: true,
            role: true,
            specialty: true,
          },
        })
      : [];

  const userMap = Object.fromEntries(users.map((u) => [u.id, u]));

  const patientEmails = memberRows
    .filter((m) => m.role === "patient")
    .map((m) => userMap[m.user_id]?.email?.trim())
    .filter((e): e is string => Boolean(e));

  const patients =
    patientEmails.length > 0
      ? await prisma.patient.findMany({
          where: { email: { in: patientEmails } },
          select: {
            id: true,
            email: true,
            firstname: true,
            lastname: true,
            birth_date: true,
            care_level: true,
          },
        })
      : [];

  const patientByEmail: Record<string, PatientClinicalPick> = {};
  for (const p of patients) {
    const key = p.email?.trim().toLowerCase();
    if (key) patientByEmail[key] = p;
  }

  return { userMap, patientByEmail };
}

/**
 * Maps a Prisma member row to detail table shape — shared by SSR loader and POST members API.
 * Pass `maps` from `loadOrganizationMemberEnrichmentMaps` to avoid N+1.
 */
export async function enrichOrganizationMemberRow(
  member: PrismaOrgMember,
  maps?: OrganizationMemberEnrichmentMaps,
  user?: UserEnrichmentPick | null
): Promise<OrganizationDetailMemberRow> {
  let u: UserEnrichmentPick | null | undefined =
    user ?? maps?.userMap[member.user_id];

  if (!u) {
    u = await prisma.user.findUnique({
      where: { id: member.user_id },
      select: {
        id: true,
        email: true,
        display_name: true,
        image: true,
        role: true,
        specialty: true,
      },
    });
  }

  const emailKey = u?.email?.trim().toLowerCase() ?? "";
  const patient =
    member.role === "patient" && emailKey && maps?.patientByEmail[emailKey]
      ? maps.patientByEmail[emailKey]
      : member.role === "patient" && emailKey && !maps
        ? await prisma.patient.findFirst({
            where: { email: u?.email ?? undefined },
            select: {
              id: true,
              email: true,
              firstname: true,
              lastname: true,
              birth_date: true,
              care_level: true,
            },
          })
        : null;

  return {
    id: member.id,
    org_id: member.org_id,
    user_id: member.user_id,
    role: member.role,
    joined_at: member.joined_at.toISOString(),
    display_name: u?.display_name ?? null,
    email: u?.email ?? null,
    image: u?.image ?? null,
    platform_role: u?.role ?? null,
    specialty: u?.specialty ?? null,
    patient_id: patient?.id ?? null,
    birth_date: patient?.birth_date?.toISOString?.() ?? null,
    care_level: patient?.care_level ?? null,
    patient_firstname: patient?.firstname ?? null,
    patient_lastname: patient?.lastname ?? null,
  };
}

function buildOwnerActor(
  ownerUserId: string,
  userMap: Record<string, UserEnrichmentPick>
): { owner: EntityDetailAuditActor | null; owner_label: string } {
  const ownerUser = userMap[ownerUserId];
  const owner = mapEntityDetailAuditActor(ownerUser ?? null);
  const owner_label =
    ownerUser?.display_name ?? ownerUser?.email ?? ownerUserId;
  return { owner, owner_label };
}

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
    include: {
      members: true,
      ...organizationDetailInclude,
    },
  });
  if (!raw) return null;

  const orgSerialized = serializeOrganization(raw);
  const viewerMembership = raw.members.find((m) => m.user_id === userId);
  const maps = await loadOrganizationMemberEnrichmentMaps(raw.members, raw.owner_user_id);
  const { owner, owner_label } = buildOwnerActor(raw.owner_user_id, maps.userMap);

  const members: OrganizationDetailMemberRow[] = await Promise.all(
    raw.members.map((m) => enrichOrganizationMemberRow(m, maps))
  );

  return {
    org: {
      ...orgSerialized,
      owner_label,
      owner,
      viewer_role:
        raw.owner_user_id === userId ? "admin" : viewerMembership?.role ?? undefined,
    },
    members,
  };
}
