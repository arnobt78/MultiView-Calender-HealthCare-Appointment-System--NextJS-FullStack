"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Navbar from "@/components/navbar/Navbar";
import { useAuth } from "@/hooks/useAuth";
import { useAppStore } from "@/store/useAppStore";
import VideoCall from "@/components/calendar/VideoCall";
import QuickActionsModal from "@/components/shared/QuickActionsModal";
import { cn } from "@/lib/utils";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

const ALLOWED_PATHS = ["/login", "/register", "/accept-invitation"];

export function AuthLayoutInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoading, isAuthenticated } = useAuth();
  const { isVideoCallActive, activeVideoAppointmentId, endVideoCall } = useAppStore();

  const isAuthPage = ALLOWED_PATHS.some((p) => pathname.startsWith(p));

  // Route guard: handle redirects once auth state resolves
  useEffect(() => {
    if (isLoading) return;

    if (isAuthenticated && user) {
      // Email verification check
      if (user.email_verified === false && !ALLOWED_PATHS.includes(pathname)) {
        router.replace("/login?verify=1");
        return;
      }
      // Redirect away from auth pages if already logged in
      if (user.email_verified !== false && ["/login", "/register"].includes(pathname)) {
        router.replace("/");
        return;
      }
    } else {
      // Redirect unauthenticated users away from protected routes
      if (!ALLOWED_PATHS.includes(pathname)) {
        router.replace("/login");
        return;
      }
    }
  }, [isLoading, isAuthenticated, user, pathname, router]);

  // Auth pages (login/register/accept-invitation): render without navbar
  if (isAuthPage && !user) {
    return <>{children}</>;
  }

  // Protected routes should not render app UI until auth is resolved.
  // This prevents protected page hooks from firing unauthenticated API calls
  // (which otherwise causes noisy 401 loops before redirect to /login).
  if (!ALLOWED_PATHS.includes(pathname) && (isLoading || !isAuthenticated)) {
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
