/**
 * SSR: Admin invoice detail — doctors redirect to portal `/invoices/[id]` (CP layout blocks doctors).
 */
import { notFound, redirect } from "next/navigation";
import { getSessionUser } from "@/lib/session";
import { getUserRole, isDoctorRole } from "@/lib/rbac";
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

export default async function ControlPanelInvoiceDetailPage({ params }: PageProps) {
  const { id } = await params;
  if (!isValidUUID(id)) notFound();

  const sessionUser = await getSessionUser();
  if (!sessionUser) notFound();

  const role = await getUserRole(sessionUser.userId);

  if (isDoctorRole(role)) {
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

  return (
    <InvoiceDetailScreen
      clientInvoice={clientInvoice}
      initialInvoicesList={(initialInvoicesList ?? []) as Invoice[]}
      uiAccess={payload.uiAccess}
      backHref="/control-panel/invoice-management"
      viewerRole={role}
      variant="control-panel"
    />
  );
}
