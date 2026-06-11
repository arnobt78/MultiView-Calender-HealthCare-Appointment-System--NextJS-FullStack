/**
 * Enriched organization list row — member + invoice aggregates for CP table/stats.
 * Shared by GET /api/organizations and prefetchOrganizations.
 */

export type OrganizationMembersByRole = {
  admin: number;
  doctor: number;
  patient: number;
};

/** Base org fields from membership join + list aggregates. */
export type OrganizationListRow = {
  id: string;
  name: string;
  slug: string;
  owner_user_id: string;
  role: string;
  created_at: string;
  description?: string | null;
  website?: string | null;
  address?: string | null;
  phone?: string | null;
  timezone?: string | null;
  logo_url?: string | null;
  org_type?: string | null;
  member_count: number;
  members_by_role: OrganizationMembersByRole;
  invoice_count: number;
  outstanding_cents: number;
};

type MemberRoleRow = { role: string };
type InvoiceStatusRow = { status: string; amount: number };

const EMPTY_ROLE_COUNTS: OrganizationMembersByRole = {
  admin: 0,
  doctor: 0,
  patient: 0,
};

const OUTSTANDING_STATUSES = new Set(["draft", "sent", "overdue"]);

/** Roll member rows into admin/doctor/patient counts. */
export function countMembersByRole(members: MemberRoleRow[]): OrganizationMembersByRole {
  const out = { ...EMPTY_ROLE_COUNTS };
  for (const m of members) {
    const r = m.role as keyof OrganizationMembersByRole;
    if (r in out) out[r] += 1;
  }
  return out;
}

/** Sum draft/sent/overdue invoice amounts in cents. */
export function sumOutstandingCents(invoices: InvoiceStatusRow[]): number {
  return invoices.reduce(
    (n, inv) => (OUTSTANDING_STATUSES.has(inv.status) ? n + inv.amount : n),
    0
  );
}

type OrgMembershipRow = {
  role: string;
  organization: {
    id: string;
    name: string;
    slug: string;
    owner_user_id: string;
    created_at: Date;
    description: string | null;
    website: string | null;
    address: string | null;
    phone: string | null;
    timezone: string | null;
    logo_url: string | null;
    org_type: string | null;
    members: MemberRoleRow[];
    invoices: InvoiceStatusRow[];
  };
};

/** Prisma include for list + prefetch — member roles + invoice status/amount only. */
export const organizationListEnrichInclude = {
  members: { select: { role: true } },
  invoices: { select: { status: true, amount: true } },
} as const;

/** Map Prisma membership rows → API list shape. */
export function mapOrganizationListRows(memberships: OrgMembershipRow[]): OrganizationListRow[] {
  return memberships.map((m) => {
    const org = m.organization;
    const membersByRole = countMembersByRole(org.members);
    return {
      id: org.id,
      name: org.name,
      slug: org.slug,
      owner_user_id: org.owner_user_id,
      role: m.role,
      created_at: org.created_at.toISOString(),
      description: org.description,
      website: org.website,
      address: org.address,
      phone: org.phone,
      timezone: org.timezone,
      logo_url: org.logo_url,
      org_type: org.org_type,
      member_count: org.members.length,
      members_by_role: membersByRole,
      invoice_count: org.invoices.length,
      outstanding_cents: sumOutstandingCents(org.invoices),
    };
  });
}

/** Load enriched org list for a user — shared by API route and SSR prefetch. */
export async function loadOrganizationsListForUser(userId: string) {
  const { prisma } = await import("@/lib/prisma");
  const memberships = await prisma.organizationMember.findMany({
    where: { user_id: userId },
    include: {
      organization: { include: organizationListEnrichInclude },
    },
  });
  return mapOrganizationListRows(
    memberships as unknown as OrgMembershipRow[]
  );
}
