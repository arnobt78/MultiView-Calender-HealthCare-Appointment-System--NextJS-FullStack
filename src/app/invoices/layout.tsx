/**
 * Portal invoice detail layout — SSR invoice list for dialog + Pay Now footer.
 */

import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/session";
import { getUserRole, isAdminRole } from "@/lib/rbac";
import { prefetchInvoices } from "@/lib/server-prefetch";
import type { Invoice } from "@/hooks/usePayments";
import InvoicesClinicianLayoutClient from "./InvoicesClinicianLayoutClient";

export const dynamic = "force-dynamic";

export default async function InvoicesLayout({
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
    <InvoicesClinicianLayoutClient
      initialInvoices={(initialInvoices ?? []) as Invoice[]}
    >
      {children}
    </InvoicesClinicianLayoutClient>
  );
}
