// Patient Portal — SSR prefetch + inline pulse fallback (no Suspense).
// Seeds TanStack on client via PatientPortalPage useLayoutEffect.

import PatientPortalPage from "@/components/pages/PatientPortalPage";
import { PatientPortalPageSkeleton } from "@/components/pages/PatientPortalPageSkeleton";
import { getSessionUser } from "@/lib/session";
import { redirect } from "next/navigation";
import { prefetchPortalData, prefetchInvoices } from "@/lib/server-prefetch";
import type { Invoice } from "@/hooks/usePayments";
import { getUserRole, isAdminRole, isDoctorRole, isPatientRole } from "@/lib/rbac";
import { isValidUUID } from "@/lib/validation";

export const dynamic = "force-dynamic";

export const metadata = { title: "Patient Portal — HealthCal Pro" };

type PageProps = {
  searchParams: Promise<{ status?: string; invoiceId?: string }>;
};

export default async function PatientPortalRoute({ searchParams }: PageProps) {
  const session = await getSessionUser();
  if (!session) redirect("/login");

  const role = await getUserRole(session.userId);
  if (isAdminRole(role)) redirect("/control-panel/dashboard-overview");
  if (isDoctorRole(role)) redirect("/doctor-portal");
  if (!isPatientRole(role)) redirect("/login");

  const sp = await searchParams;

  // Legacy list deep-link → full invoice detail route (matches invoiceDetailHref).
  const legacyInvoiceId = sp.invoiceId?.trim();
  if (legacyInvoiceId && isValidUUID(legacyInvoiceId)) {
    redirect(`/invoices/${legacyInvoiceId}`);
  }

  const paymentReturnStatus =
    sp.status === "success" || sp.status === "cancelled" ? sp.status : null;

  const [initialPortalData, initialInvoices] = await Promise.all([
    prefetchPortalData(session.userId),
    prefetchInvoices(session.userId, role, session.email),
  ]);

  if (!initialPortalData) {
    return <PatientPortalPageSkeleton />;
  }

  return (
    <PatientPortalPage
      initialPortalData={initialPortalData}
      initialInvoices={(initialInvoices ?? []) as Invoice[]}
      paymentReturnStatus={paymentReturnStatus}
    />
  );
}
