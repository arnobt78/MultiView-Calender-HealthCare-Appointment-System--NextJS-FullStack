"use client";

/**
 * AuthShell — global layout wrapper.
 *
 * Route PROTECTION is handled entirely by src/middleware.ts (edge).
 * This component only decides which chrome (Navbar, etc.) to render.
 * No redirects, no loading placeholders, no flash.
 */

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { Inter } from "next/font/google";
import Navbar from "@/components/navbar/Navbar";
import { useAppStore } from "@/store/useAppStore";
import VideoCall from "@/components/calendar/VideoCall";
import QuickActionsModal from "@/components/shared/QuickActionsModal";
import { AppProviders } from "@/providers/AppProviders";
import { cn } from "@/lib/utils";
import { notify } from "@/lib/notify";

const inter = Inter({ subsets: ["latin"] });

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

  // Landing page and auth pages — render children as-is (no dashboard chrome)
  if (isBare(pathname)) {
    return <>{children}</>;
  }

  const isDashboard = pathname === "/dashboard";

  // All protected pages — render with dashboard layout.
  // Middleware already verified auth before the browser received this HTML,
  // so no loading state or redirect is needed here.
  return (
    <div
      className={cn(
        "flex h-dvh min-h-0 max-h-dvh flex-col overflow-x-hidden bg-gradient-to-br from-slate-50 via-white to-slate-100 text-gray-900",
        inter.className
      )}
    >
      <Navbar />
      <main
        className={cn(
          "min-h-0 flex-1",
          isDashboard ? "flex flex-col overflow-hidden" : "overflow-y-auto"
        )}
      >
        {children}
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

export default function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <AppProviders>
      <AuthShellInner>{children}</AuthShellInner>
    </AppProviders>
  );
}
