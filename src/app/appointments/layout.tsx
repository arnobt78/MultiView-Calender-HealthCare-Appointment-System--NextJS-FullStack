/**
 * Portal appointment detail layout — SSR invoice list for dialog + billing actions.
 */

import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/session";
import { getUserRole, isAdminRole } from "@/lib/rbac";
import { prefetchInvoices } from "@/lib/server-prefetch";
import type { Invoice } from "@/hooks/usePayments";
import AppointmentsStaffLayoutClient from "./AppointmentsStaffLayoutClient";

export const dynamic = "force-dynamic";

export default async function AppointmentsLayout({
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
    <AppointmentsStaffLayoutClient
      initialInvoices={(initialInvoices ?? []) as Invoice[]}
    >
      {children}
    </AppointmentsStaffLayoutClient>
  );
}
