/**
 * Control Panel Route Layout
 *
 * Mirrors the stock-inventory `AdminLayout` + `PageWithSidebar` pattern:
 *   - AuthShell locks the outer shell to `h-dvh` (viewport-height, no document scroll).
 *   - This layout fills the remaining height with a flex row:
 *       left:  ControlPanelSidebarNav  — persistent desktop sidebar, never remounts on route change.
 *       right: scrollable content pane — `overflow-y-auto` so only the content scrolls,
 *              not the page; sidebar position is therefore stable regardless of content length.
 *
 * SSR: prefetches doctor + admin + all-user lists once for every CP route — management/org tabs
 * read warm `useUsers` cache without per-tab fetch flash.
 */

import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { StaffInvoiceDialogShell } from "@/components/shared/billing/StaffInvoiceDialogShell";
import ControlPanelSidebarNav from "@/components/control-panel/ControlPanelSidebarNav";
import ControlPanelSsrCacheSeed from "@/components/control-panel/ControlPanelSsrCacheSeed";
import {
  CP_ADMIN_USERS_FILTERS,
  CP_ALL_USERS_FILTERS,
  CP_DOCTOR_USERS_FILTERS,
} from "@/lib/control-panel-users-filters";
import { getSessionUser } from "@/lib/session";
import { getUserRole, isDoctorRole, isPatientRole } from "@/lib/rbac";
import { prefetchUsersList } from "@/lib/server-prefetch";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Control Panel",
  description:
    "Manage invitations, permissions, and access control for appointments and dashboards in the Doctor Patient Calendar system.",
  keywords: [
    "control panel",
    "permissions",
    "invitations",
    "access control",
    "appointment management",
    "dashboard access",
  ],
  robots: {
    index: false,
    follow: false,
  },
};

export default async function ControlPanelLayout({
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
    if (isDoctorRole(role)) {
      redirect("/doctor-portal");
    }
  }

  let initialDoctorUsers = null;
  let initialAdminUsers = null;
  let initialAllUsers = null;

  if (sessionUser) {
    [initialDoctorUsers, initialAdminUsers, initialAllUsers] = await Promise.all([
      prefetchUsersList(CP_DOCTOR_USERS_FILTERS),
      prefetchUsersList(CP_ADMIN_USERS_FILTERS),
      prefetchUsersList(CP_ALL_USERS_FILTERS),
    ]);
  }

  return (
    <StaffInvoiceDialogShell variant="admin">
      <div className="flex h-full min-h-0 w-full max-w-9xl mx-auto bg-gradient-to-br from-slate-50 via-white to-slate-100">
        <ControlPanelSidebarNav />
        <ControlPanelSsrCacheSeed
          initialDoctorUsers={initialDoctorUsers}
          initialAdminUsers={initialAdminUsers}
          initialAllUsers={initialAllUsers}
        />
        <div className="cp-right-scroll flex-1 min-w-0 overflow-y-auto overscroll-contain px-2 sm:px-4 lg:px-8">
          {children}
        </div>
      </div>
    </StaffInvoiceDialogShell>
  );
}
