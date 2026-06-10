"use client";

/**
 * AuthShell — global layout wrapper.
 *
 * Route PROTECTION is handled at two layers:
 *   1. Edge (proxy.ts at repo root) — verifies auth-token cookie presence;
 *      redirects unauthenticated visitors to /login before the page renders.
 *   2. Server Component layouts (e.g. control-panel/layout.tsx) — enforce RBAC
 *      (patient role → redirect to /patient-portal, etc.) using getSessionUser + getUserRole.
 *
 * This component only decides which chrome (Navbar, etc.) to render.
 * No redirects, no loading placeholders, no flash.
 */

import { useEffect, useLayoutEffect } from "react";
import { usePathname } from "next/navigation";
import { Inter } from "next/font/google";
import Navbar from "@/components/navbar/Navbar";
import { useAppStore } from "@/store/useAppStore";
import VideoCall from "@/components/calendar/VideoCall";
import QuickActionsModal from "@/components/shared/QuickActionsModal";
import { AppProviders } from "@/providers/AppProviders";
import { dashboardShellClass } from "@/lib/dashboard-layout";
import { APP_MAIN_OFFSET_CLASS } from "@/lib/portal-z-index";
import { cn } from "@/lib/utils";
import { notify } from "@/lib/notify";
import { NavRoleProvider } from "@/context/NavRoleContext";
import { NavSessionSsrSeed } from "@/components/navbar/NavSessionSsrSeed";
import type { NavSsrUser } from "@/lib/nav-session-ssr-seed";

const inter = Inter({ subsets: ["latin"] });

/**
 * useIsomorphicLayoutEffect — useLayoutEffect on the client, useEffect on the server.
 *
 * "use client" components still render on the server (SSR) for the initial HTML, but
 * effects never run during SSR.  Choosing useLayoutEffect on the client means the
 * overflow:hidden assignment fires synchronously after React's DOM commit but
 * BEFORE the browser paints — eliminating the visible scrollbar-gutter layout shift
 * (the ~6-15px "bounce/vibrate") that useEffect caused on every page load.
 */
const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

// Paths that render without the dashboard chrome (Navbar, etc.)
const BARE_PATHS = ["/", "/login", "/register", "/accept-invitation"];

function isBare(pathname: string): boolean {
  return BARE_PATHS.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );
}

/**
 * Prevents layout shift caused by react-remove-scroll (used internally by
 * Radix Dialog, AlertDialog, Sheet, etc.).  When those components open they
 * inject a <style> tag that adds `padding-right: <scrollbar-width>px` to
 * body to compensate for the hidden scrollbar.  Because that tag is appended
 * AFTER our global CSS, cascade order makes it win even over !important rules.
 *
 * The MutationObserver fires synchronously (microtask) the moment the
 * `data-scroll-locked` attribute is added/removed and applies an inline
 * style — inline styles always beat stylesheet rules, so the shift is
 * cancelled before the browser paints.
 */
function useScrollLockFix() {
  useEffect(() => {
    const fix = () => {
      if (document.body.hasAttribute("data-scroll-locked")) {
        document.body.style.setProperty("padding-right", "0px", "important");
        document.body.style.setProperty("margin-right", "0px", "important");
      } else {
        document.body.style.removeProperty("padding-right");
        document.body.style.removeProperty("margin-right");
      }
    };
    const observer = new MutationObserver(fix);
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ["data-scroll-locked"],
    });
    return () => observer.disconnect();
  }, []);
}

function AuthShellInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { isVideoCallActive, activeVideoAppointmentId, endVideoCall } = useAppStore();

  // Globally suppress the body padding-right shift that react-remove-scroll
  // injects whenever any Dialog / AlertDialog / Sheet opens.
  useScrollLockFix();

  useEffect(() => {
    const loginRaw =
      sessionStorage.getItem("post-login-toast") || localStorage.getItem("post-login-toast");
    if (loginRaw) {
      sessionStorage.removeItem("post-login-toast");
      localStorage.removeItem("post-login-toast");
      try {
        const parsed = JSON.parse(loginRaw) as { name?: string; todayCount?: number };
        requestAnimationFrame(() => {
          notify.loginWelcome({
            name: parsed?.name || "there",
            todayCount: Number(parsed?.todayCount ?? 0),
          });
        });
      } catch {
        requestAnimationFrame(() => {
          notify.loginWelcome({ name: "there", todayCount: 0 });
        });
      }
    }

    const logoutRaw =
      sessionStorage.getItem("post-logout-toast") || localStorage.getItem("post-logout-toast");
    if (logoutRaw) {
      sessionStorage.removeItem("post-logout-toast");
      localStorage.removeItem("post-logout-toast");
      try {
        const parsed = JSON.parse(logoutRaw) as { name?: string };
        requestAnimationFrame(() => {
          notify.logoutGoodbye({ name: parsed?.name || "there" });
        });
      } catch {
        requestAnimationFrame(() => {
          notify.logoutGoodbye({ name: "there" });
        });
      }
    }
  }, [pathname]);

  const isDashboard = pathname === "/dashboard";
  const isControlPanel = pathname.startsWith("/control-panel");

  /*
   * globals.css sets `html { overflow-y: scroll; scrollbar-gutter: stable }` to prevent
   * layout shift on document-scrolling routes. On viewport-locked routes (dashboard,
   * control-panel) the document never scrolls, but the gutter reservation still adds
   * a ~6-15px dead space on the right edge of the viewport.
   *
   * Setting `overflow: hidden` on the html element inline-style releases that gutter so
   * the layout fills the full viewport width. The cleanup removes the inline style so
   * document-scrolling routes get their stable gutter back immediately on navigation.
   *
   * useIsomorphicLayoutEffect (instead of useEffect) fires synchronously before the
   * browser first paints — this is the key fix for the "screen bounce/vibrate" bug.
   * Without it, useEffect fired AFTER the first paint with the scrollbar gutter still
   * reserved, then removed it, causing a visible ~6-15px layout shift on every refresh.
   *
   * This hook MUST stay before any early return to satisfy Rules of Hooks.
   */
  useIsomorphicLayoutEffect(() => {
    const html = document.documentElement;
    if (isDashboard || isControlPanel) {
      html.style.setProperty("overflow", "hidden");
    } else {
      html.style.removeProperty("overflow");
    }
    return () => { html.style.removeProperty("overflow"); };
  }, [isDashboard, isControlPanel]);

  // Landing page and auth pages — render children as-is (no dashboard chrome)
  if (isBare(pathname)) {
    return <>{children}</>;
  }

  // All protected pages — render with dashboard layout.
  // Middleware already verified auth before the browser received this HTML,
  // so no loading state or redirect is needed here.
  return (
    <div
      className={cn(
        "flex min-w-0 flex-col bg-linear-to-br from-slate-50 via-white to-slate-100 text-gray-700",
        /*
         * Dashboard + Control-panel: lock the outer shell to `h-dvh` so that:
         *   - Dashboard: inner calendar scroll works (overflow-hidden on main).
         *   - Control panel: `control-panel/layout.tsx` can stretch to `h-full` of the
         *     `<main>` and give its right pane `overflow-y-auto` a bounded height.
         *     This mirrors the stock-inventory `Navbar` h-screen shell pattern.
         * Other routes: `min-h-dvh` allows document scroll naturally.
         */
        (isDashboard || isControlPanel) && "overflow-x-hidden",
        isDashboard || isControlPanel ? "h-dvh min-h-0 max-h-dvh" : "min-h-dvh",
        inter.className
      )}
    >
      <Navbar />
      {/*
       * Dashboard: viewport-locked flex column, inner calendar view scrolls.
       * Control panel: viewport-locked flex column, `control-panel/layout.tsx`
       *   owns the sidebar + scrollable right pane (no document scroll).
       *   This is the same `AdminLayout` + PageWithSidebar pattern in stock-inventory.
       * Other routes: natural document scroll with `dashboardShellClass` wrapper.
       */}
      <main
        className={cn(
          APP_MAIN_OFFSET_CLASS,
          "min-w-0 w-full px-0",
          isDashboard || isControlPanel
            ? "flex min-h-0 flex-1 flex-col overflow-hidden"
            : "flex-1 overflow-x-visible overflow-y-visible"
        )}
      >
        {isDashboard || isControlPanel ? (
          children
        ) : (
          <div className={dashboardShellClass}>{children}</div>
        )}
      </main>

      {isVideoCallActive && activeVideoAppointmentId && (
        <VideoCall
          appointmentId={activeVideoAppointmentId}
          appointmentTitle="Video Consultation"
          onClose={endVideoCall}
        />
      )}

      <QuickActionsModal />
    </div>
  );
}

export default function AuthShell({
  children,
  initialNavRole = null,
  initialNavUser = null,
}: {
  children: React.ReactNode;
  /** From root layout — same on SSR and hydration for stable navbar role links. */
  initialNavRole?: string | null;
  /** Full session user for auth/me cache seed — avoids navbar avatar flash. */
  initialNavUser?: NavSsrUser | null;
}) {
  return (
    <AppProviders>
      <NavRoleProvider role={initialNavRole}>
        <NavSessionSsrSeed user={initialNavUser} />
        <AuthShellInner>{children}</AuthShellInner>
      </NavRoleProvider>
    </AppProviders>
  );
}
