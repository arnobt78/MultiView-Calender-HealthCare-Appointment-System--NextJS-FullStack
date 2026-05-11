/**
 * Dashboard route group — calendar home for staff (admin / doctor / secretary).
 * Patient-role accounts use the dedicated portal; this layout keeps them off the
 * staff calendar shell while still allowing staff to default here after login.
 */

import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/session";
import { getUserRole, isPatientRole } from "@/lib/rbac";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const sessionUser = await getSessionUser();
  if (sessionUser) {
    const role = await getUserRole(sessionUser.userId);
    if (isPatientRole(role)) {
      redirect("/patient-portal");
    }
  }

  return <>{children}</>;
}
