// Dashboard page — Server Component (async)
// Pre-fetches categories, patients, assignees, and the merged calendar list so
// HomePage seeds TanStack Query before first paint — no calendar loading flash.

export const dynamic = "force-dynamic";

import HomePage from "@/components/pages/HomePage";
import { getSessionUser } from "@/lib/session";
import { getUserRole } from "@/lib/rbac";
import {
  prefetchCategories,
  prefetchPatients,
  prefetchDashboardAppointments,
  prefetchAppointmentAssigneesForUser,
  prefetchDashboardAccessAccepted,
  prefetchInvoices,
} from "@/lib/server-prefetch";
import type { Invoice } from "@/hooks/usePayments";
import type { Category, Patient, AppointmentAssignee } from "@/types/types";
import type { FullAppointment } from "@/hooks/useAppointments";
import type { DashboardAccessRow } from "@/lib/query-fetchers";

export default async function DashboardPage() {
  const session = await getSessionUser();

  let initialCategories: Category[] | null = null;
  let initialPatients: Patient[] | null = null;
  let initialAssignees: AppointmentAssignee[] | null = null;
  let initialAppointments: FullAppointment[] | null = null;
  let initialDashboardAccessAccepted: DashboardAccessRow[] | null = null;
  let initialInvoices: Invoice[] | null = null;

  if (session) {
    const role = await getUserRole(session.userId);
    [initialCategories, initialPatients, initialAssignees, initialDashboardAccessAccepted, initialInvoices] =
      await Promise.all([
        prefetchCategories(),
        prefetchPatients(),
        prefetchAppointmentAssigneesForUser(session.userId, session.email),
        prefetchDashboardAccessAccepted(session.userId, session.email),
        prefetchInvoices(session.userId, role, session.email),
      ]);

    initialAppointments = await prefetchDashboardAppointments(
      session.userId,
      session.email,
      {
        categories: initialCategories,
        patients: initialPatients,
        assignees: initialAssignees,
      }
    );
  }

  return (
    <div className="flex h-full min-h-0 min-w-0 flex-1 flex-col">
      <HomePage
        initialCategories={initialCategories}
        initialPatients={initialPatients}
        initialAssignees={initialAssignees}
        initialAppointments={initialAppointments}
        initialDashboardAccessAccepted={initialDashboardAccessAccepted}
        initialInvoices={(initialInvoices ?? []) as Invoice[]}
      />
    </div>
  );
}
