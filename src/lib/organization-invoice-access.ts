/**
 * Org-scoped billing — any org member may view org-tagged invoices; org `admin` may tag/list via API filter.
 */

import { prisma } from "@/lib/prisma";
import { isValidUUID } from "@/lib/validation";

/** Org IDs where the user is an org-level admin (not platform admin). */
export async function getOrganizationAdminOrgIds(userId: string): Promise<string[]> {
  const rows = await prisma.organizationMember.findMany({
    where: { user_id: userId, role: "admin" },
    select: { org_id: true },
  });
  return rows.map((r) => r.org_id);
}

/** All orgs the user belongs to (any member role). */
export async function getOrganizationMemberOrgIds(userId: string): Promise<string[]> {
  const rows = await prisma.organizationMember.findMany({
    where: { user_id: userId },
    select: { org_id: true },
  });
  return rows.map((r) => r.org_id);
}

/** View/list org invoices — any member of the organization. */
export async function userCanViewOrganizationInvoices(
  userId: string,
  organizationId: string
): Promise<boolean> {
  if (!isValidUUID(organizationId)) return false;
  const row = await prisma.organizationMember.findFirst({
    where: { user_id: userId, org_id: organizationId },
    select: { id: true },
  });
  return row != null;
}

/** Tag invoices / explicit org on create — org-level admin (or platform admin via route RBAC). */
export async function userCanAccessOrganizationInvoices(
  userId: string,
  organizationId: string
): Promise<boolean> {
  if (!isValidUUID(organizationId)) return false;
  const row = await prisma.organizationMember.findFirst({
    where: { user_id: userId, org_id: organizationId, role: "admin" },
    select: { id: true },
  });
  return row != null;
}
