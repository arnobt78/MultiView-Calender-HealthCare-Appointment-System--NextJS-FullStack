// Patient Portal — async Server Component
// Pre-fetches portal data (patient record + appointment history) so
// PatientPortalPage seeds the TanStack Query cache on first render —
// profile and appointment timeline show instantly with no loading flash.
//
// RBAC: only users with the "patient" role may access this route.
// Staff / admin / doctor are redirected to the control panel.

import PatientPortalPage from "@/components/pages/PatientPortalPage";
import { getSessionUser } from "@/lib/session";
import { redirect } from "next/navigation";
import { prefetchPortalData } from "@/lib/server-prefetch";
import type { PortalPrefetchData } from "@/lib/server-prefetch";
import { getUserRole, isPatientRole } from "@/lib/rbac";

export const metadata = { title: "Patient Portal — Vocare" };

export default async function PatientPortalRoute() {
  const session = await getSessionUser();
  if (!session) redirect("/login");

  // Redirect non-patient roles (admin, doctor, secretary) to the control panel.
  const role = await getUserRole(session.userId);
  if (!isPatientRole(role)) redirect("/control-panel/dashboard-overview");

  // Pre-fetch portal data — best-effort, returns null if no patient record found
  const initialPortalData: PortalPrefetchData | null = await prefetchPortalData(session.userId);

  return <PatientPortalPage initialPortalData={initialPortalData} />;
}
