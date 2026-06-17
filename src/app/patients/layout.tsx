/**
 * Portal patient detail layout — SSR invoice list for dialog + related-invoices Edit actions.
 */

import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/session";
import { getUserRole, isAdminRole } from "@/lib/rbac";
import { prefetchInvoices } from "@/lib/server-prefetch";
import type { Invoice } from "@/hooks/usePayments";
import PatientsClinicianLayoutClient from "./PatientsClinicianLayoutClient";

export const dynamic = "force-dynamic";

export default async function PatientsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const sessionUser = await getSessionUser();
  if (!sessionUser) redirect("/login");

  const role = await getUserRole(sessionUser.userId);
  const initialInvoices = isAdminRole(role)
    ? null
    : await prefetchInvoices(sessionUser.userId, role, sessionUser.email);

  return (
    <PatientsClinicianLayoutClient
      initialInvoices={(initialInvoices ?? []) as Invoice[]}
    >
      {children}
    </PatientsClinicianLayoutClient>
  );
}
