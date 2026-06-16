export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { redirect } from "next/navigation";
import TelehealthQueuePage from "@/components/control-panel/telehealth/TelehealthQueuePage";
import { getSessionUser } from "@/lib/session";
import { getUserRole, isAdminRole, isDoctorRole, isPatientRole } from "@/lib/rbac";
import { prefetchTelehealthQueuePortal } from "@/lib/telehealth-queue-portal-prefetch";

export const metadata: Metadata = {
  title: "Telehealth Queue — HealthCal Pro",
  description: "Live telehealth queue — join video visits and book new telehealth appointments.",
};

/** Doctor/patient portal telehealth queue — admin redirects to control panel tab. */
export default async function TelehealthQueueRoute() {
  const session = await getSessionUser();
  if (!session) redirect("/login");

  const role = await getUserRole(session.userId);

  if (isAdminRole(role)) {
    redirect("/control-panel/telehealth-queue");
  }

  if (!isDoctorRole(role) && !isPatientRole(role)) {
    redirect("/login");
  }

  const initialPrefetch = await prefetchTelehealthQueuePortal(
    session.userId,
    session.email,
    role
  );

  return (
    <TelehealthQueuePage
      viewerRole={role}
      shell="portal"
      initialPrefetch={initialPrefetch}
    />
  );
}
