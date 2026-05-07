// Patient Portal — async Server Component
// Pre-fetches portal data (patient record + appointment history) so
// PatientPortalPage seeds the TanStack Query cache on first render —
// profile and appointment timeline show instantly with no loading flash.

import PatientPortalPage from "@/components/pages/PatientPortalPage";
import { getSessionUser } from "@/lib/session";
import { redirect } from "next/navigation";
import { prefetchPortalData } from "@/lib/server-prefetch";
import type { PortalPrefetchData } from "@/lib/server-prefetch";

export const metadata = { title: "Patient Portal — Vocare" };

export default async function PatientPortalRoute() {
  const session = await getSessionUser();
  if (!session) redirect("/login");

  // Pre-fetch portal data — best-effort, returns null if no patient record found
  const initialPortalData: PortalPrefetchData | null = await prefetchPortalData(session.userId);

  return <PatientPortalPage initialPortalData={initialPortalData} />;
}
