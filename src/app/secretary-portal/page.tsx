// Secretary Portal — async Server Component
// Pre-fetches clinic-wide appointment data, patient roster, and doctor directory
// so SecretaryPortalPage seeds TanStack Query cache before first paint.
//
// RBAC: only users with the "secretary" role may access this route.

import SecretaryPortalPage from "@/components/pages/SecretaryPortalPage";
import { getSessionUser } from "@/lib/session";
import { redirect } from "next/navigation";
import { prefetchSecretaryPortal } from "@/lib/server-prefetch";
import type { SecretaryPortalData } from "@/types/types";
import { getUserRole, isSecretaryRole } from "@/lib/rbac";

export const metadata = { title: "Secretary Portal — HealthCal Pro" };

export default async function SecretaryPortalRoute() {
  const session = await getSessionUser();
  if (!session) redirect("/login");

  const role = await getUserRole(session.userId);
  if (!isSecretaryRole(role)) redirect("/control-panel/dashboard-overview");

  const initialData: SecretaryPortalData | null = await prefetchSecretaryPortal(session.userId);

  return <SecretaryPortalPage initialData={initialData} />;
}
