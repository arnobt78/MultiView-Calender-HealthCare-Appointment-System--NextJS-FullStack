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
 * Because the sidebar lives HERE (in the route layout) and not inside any page component,
 * it persists across ALL /control-panel/* routes — section pages AND detail pages
 * (/control-panel/patients/[id], /appointments/[id], /doctors/[id], /invoices/[id]).
 * This was the root cause of the "sidebar jumps" bug: the sidebar was previously inside
 * `ControlPanelPage` (a per-page component) which remounted on every tab navigation.
 */

import type { Metadata } from "next";
import { redirect } from "next/navigation";
import ControlPanelSidebarNav from "@/components/control-panel/ControlPanelSidebarNav";
import { getSessionUser } from "@/lib/session";
import { getUserRole, isDoctorRole, isPatientRole } from "@/lib/rbac";

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
  /*
   * RBAC gate — server-side role check before rendering any control-panel chrome.
   * Edge proxy (proxy.ts) only verifies cookie presence; role enforcement lives here.
   * Patient-role users → patient portal; doctors → doctor portal.
   * Control panel is admin-only (management shell + sidebar).
   */
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

  // bg-gradient mirrors AuthShell's shell gradient so that during the hydration frame
  // where TabsContent is active but the component hasn't painted yet, the dark html/body
  // (#0f172a / #020617) cannot bleed through the transparent pane.
  // This is the fix for the intermittent "black tab area on refresh" bug.
  return (
    <div className="flex h-full min-h-0 w-full max-w-9xl mx-auto bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Persistent desktop sidebar — see ControlPanelSidebarNav for routing logic */}
      <ControlPanelSidebarNav />

      {/*
       * Right content pane — the inner scroll owner for all control-panel pages.
       * `overflow-y-auto` keeps the sidebar stationary while only the page content scrolls.
       * `overscroll-contain` prevents scroll chaining to the document.
       * Horizontal padding gives glassmorphic card shadows room to render without clipping.
       */}
      {/* cp-right-scroll: hides the scrollbar track (no gutter reservation, no layout shift) while keeping scroll functional. */}
      <div className="cp-right-scroll flex-1 min-w-0 overflow-y-auto overscroll-contain px-2 sm:px-4 lg:px-8">
        {children}
      </div>
    </div>
  );
}
