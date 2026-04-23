"use client";

/**
 * AuthShell — global layout wrapper.
 *
 * Route PROTECTION is handled entirely by src/middleware.ts (edge).
 * This component only decides which chrome (Navbar, etc.) to render.
 * No redirects, no loading placeholders, no flash.
 */

import { usePathname } from "next/navigation";
import { Inter } from "next/font/google";
import Navbar from "@/components/navbar/Navbar";
import { useAppStore } from "@/store/useAppStore";
import VideoCall from "@/components/calendar/VideoCall";
import QuickActionsModal from "@/components/shared/QuickActionsModal";
import { AppProviders } from "@/providers/AppProviders";
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"] });

// Paths that render without the dashboard chrome (Navbar, etc.)
const BARE_PATHS = ["/", "/login", "/register", "/accept-invitation"];

function isBare(pathname: string): boolean {
  return BARE_PATHS.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );
}

function AuthShellInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { isVideoCallActive, activeVideoAppointmentId, endVideoCall } = useAppStore();

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
        "min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 text-gray-900",
        inter.className
      )}
    >
      <Navbar />
      {children}

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
