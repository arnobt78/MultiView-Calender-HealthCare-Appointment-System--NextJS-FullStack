// Doctor Portal — async Server Component
// Pre-fetches all data the doctor portal needs (today's schedule, patients,
// appointment type config, metrics) so DoctorPortalPage seeds the TanStack
// Query cache on first paint — no loading flash for authenticated doctors.
//
// RBAC: only users with the "doctor" role may access this route.
// Admin / secretary / patient are redirected to their respective dashboards.

import DoctorPortalPage from "@/components/pages/DoctorPortalPage";
import { getSessionUser } from "@/lib/session";
import { redirect } from "next/navigation";
import { prefetchDoctorPortal } from "@/lib/server-prefetch";
import type { DoctorPortalData } from "@/types/types";
import { getUserRole, isDoctorRole } from "@/lib/rbac";

export const metadata = { title: "Doctor Portal — HealthCal Pro" };

export default async function DoctorPortalRoute() {
  const session = await getSessionUser();
  if (!session) redirect("/login");

  // Only doctors may access this portal; redirect other roles to appropriate pages
  const role = await getUserRole(session.userId);
  if (!isDoctorRole(role)) redirect("/control-panel/dashboard-overview");

  // Pre-fetch portal data — best-effort, returns null if DB unavailable
  const initialData: DoctorPortalData | null = await prefetchDoctorPortal(session.userId);

  return <DoctorPortalPage initialData={initialData} />;
}
