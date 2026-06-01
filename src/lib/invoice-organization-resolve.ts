/**
 * organization_id on invoice create — explicit tag when allowed; else infer from visit billing doctor org memberships.
 */

import { prisma } from "@/lib/prisma";
import { isValidUUID } from "@/lib/validation";
import { isAdminRole } from "@/lib/rbac";
import {
  getOrganizationAdminOrgIds,
  userCanAccessOrganizationInvoices,
} from "@/lib/organization-invoice-access";

export type ResolveInvoiceOrganizationInput = {
  sessionUserId: string;
  role: string | null;
  appointmentId: string | null;
  billingUserId: string;
  explicitOrganizationId?: string | null;
};

/** Caller may set org explicitly (admin or org admin); otherwise single shared org on billing doctor wins. */
export async function resolveInvoiceOrganizationId(
  input: ResolveInvoiceOrganizationInput
): Promise<{ organizationId: string | null; forbidden?: boolean }> {
  const explicit = input.explicitOrganizationId?.trim();
  if (explicit) {
    if (!isValidUUID(explicit)) return { organizationId: null, forbidden: true };
    if (isAdminRole(input.role)) return { organizationId: explicit };
    const allowed = await userCanAccessOrganizationInvoices(
      input.sessionUserId,
      explicit
    );
    return allowed
      ? { organizationId: explicit }
      : { organizationId: null, forbidden: true };
  }

  if (!input.appointmentId) return { organizationId: null };

  const memberships = await prisma.organizationMember.findMany({
    where: { user_id: input.billingUserId },
    select: { org_id: true },
    orderBy: { joined_at: "asc" },
  });
  const billingOrgIds = memberships.map((m) => m.org_id);
  if (billingOrgIds.length === 0) return { organizationId: null };
  if (billingOrgIds.length === 1) return { organizationId: billingOrgIds[0]! };

  const creatorAdminOrgIds = await getOrganizationAdminOrgIds(input.sessionUserId);
  const shared = billingOrgIds.filter((id) => creatorAdminOrgIds.includes(id));
  if (shared.length === 1) return { organizationId: shared[0]! };

  // Deterministic fallback: billing doctor's earliest org membership (avoids silent untagged invoices).
  if (billingOrgIds.length > 0) return { organizationId: billingOrgIds[0]! };

  return { organizationId: null };
}
