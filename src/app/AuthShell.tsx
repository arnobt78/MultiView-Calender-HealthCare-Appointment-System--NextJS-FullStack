"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Inter } from "next/font/google";
import Navbar from "@/components/navbar/Navbar";
import { useAuth } from "@/hooks/useAuth";
import { useAppStore } from "@/store/useAppStore";
import VideoCall from "@/components/calendar/VideoCall";
import QuickActionsModal from "@/components/shared/QuickActionsModal";
import { AppProviders } from "@/providers/AppProviders";
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"] });

const PUBLIC_PATHS = ["/", "/login", "/register", "/accept-invitation"];

function isPublicPath(pathname: string) {
  if (pathname === "/") return true;
  return PUBLIC_PATHS.slice(1).some((p) => pathname.startsWith(p));
}

function AuthShellInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoading, isAuthenticated } = useAuth();
  const { isVideoCallActive, activeVideoAppointmentId, endVideoCall } = useAppStore();

  useEffect(() => {
    if (isLoading) return;

    if (isAuthenticated && user) {
      if (user.email_verified === false && !isPublicPath(pathname)) {
        router.replace("/login?verify=1");
        return;
      }
      if (user.email_verified !== false && ["/login", "/register"].includes(pathname)) {
        router.replace("/");
        return;
      }
    } else {
      if (!isPublicPath(pathname)) {
        router.replace("/login");
      }
    }
  }, [isLoading, isAuthenticated, user, pathname, router]);

  // Public routes (including landing `/` when unauthenticated): render raw
  if (isPublicPath(pathname) && !user) {
    return <>{children}</>;
  }

  // Protected routes that haven't resolved auth yet: dark placeholder (no flash)
  if (!isPublicPath(pathname) && (isLoading || !isAuthenticated)) {
    return <div style={{ minHeight: "100vh", backgroundColor: "#020617" }} />;
  }

  return (
    <div className={cn("min-h-screen bg-gradient-to-br from-white via-slate-50 to-slate-100 text-gray-900", inter.className)}>
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
