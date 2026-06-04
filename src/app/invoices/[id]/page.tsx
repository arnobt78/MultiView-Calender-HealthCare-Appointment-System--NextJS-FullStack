/**
 * Doctor / patient invoice detail — dashboard shell (no control-panel sidebar).
 * Admin users redirect to CP invoice route (same pattern as `/appointments/[id]`).
 */

import { notFound, redirect } from "next/navigation";
import { getSessionUser } from "@/lib/session";
import { getUserRole, isAdminRole, isPatientRole } from "@/lib/rbac";
import { isValidUUID } from "@/lib/validation";
import { invoiceDetailHref } from "@/lib/entity-routes";
import { loadInvoiceDetailForPage } from "@/lib/invoice-detail-ssr";
import { prefetchInvoiceDetail, prefetchInvoices } from "@/lib/server-prefetch";
import { InvoiceDetailScreen } from "@/components/detail/InvoiceDetailScreen";
import type { Invoice } from "@/hooks/usePayments";

export const dynamic = "force-dynamic";

type PageProps = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  return { title: `Invoice — ${id.slice(0, 8)}` };
}

export default async function PortalInvoiceDetailPage({ params }: PageProps) {
  const { id } = await params;
  if (!isValidUUID(id)) notFound();

  const sessionUser = await getSessionUser();
  if (!sessionUser) notFound();

  const role = await getUserRole(sessionUser.userId);

  if (isAdminRole(role)) {
    redirect(invoiceDetailHref(role, id));
  }

  const session = {
    userId: sessionUser.userId,
    email: sessionUser.email,
    role,
  };

  const [payload, prefetched, initialInvoicesList] = await Promise.all([
    loadInvoiceDetailForPage(id, session),
    prefetchInvoiceDetail(id, sessionUser.userId, role, sessionUser.email),
    prefetchInvoices(sessionUser.userId, role, sessionUser.email),
  ]);

  if (!payload) notFound();

  const clientInvoice = (prefetched ?? payload.clientInvoice) as Invoice;
  const backHref = isPatientRole(role) ? "/patient-portal" : "/doctor-portal";

  return (
    <InvoiceDetailScreen
      clientInvoice={clientInvoice}
      initialInvoicesList={(initialInvoicesList ?? []) as Invoice[]}
      uiAccess={payload.uiAccess}
      backHref={backHref}
      viewerRole={role}
      variant="portal"
    />
  );
}
