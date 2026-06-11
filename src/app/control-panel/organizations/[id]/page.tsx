/**
 * SSR: Organization detail page — schema fields + members + billing prefetch.
 */
export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { isValidUUID } from "@/lib/validation";
import { OrganizationDetailScreen } from "@/components/control-panel/OrganizationDetailScreen";
import { loadOrganizationDetailForUser } from "@/lib/organization-detail-load";
import { prefetchOrganizations } from "@/lib/server-prefetch";
import { prefetchOrgBillingInvoicesByOrgIds } from "@/lib/org-billing-prefetch";

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

  const sessionDbUser = await prisma.user.findUnique({
    where: { id: sessionUser.userId },
    select: { role: true },
  });
  const viewerRole = sessionDbUser?.role ?? null;

  const [detail, initialOrganizations, orgBillingMap] = await Promise.all([
    loadOrganizationDetailForUser(id, sessionUser.userId),
    prefetchOrganizations(sessionUser.userId),
    prefetchOrgBillingInvoicesByOrgIds(
      [id],
      sessionUser.userId,
      viewerRole,
      sessionUser.email
    ),
  ]);
  if (!detail) notFound();

  return (
    <OrganizationDetailScreen
      org={detail.org}
      members={detail.members}
      initialOrganizations={initialOrganizations}
      initialOrgBilling={orgBillingMap[id] ?? null}
    />
  );
}
