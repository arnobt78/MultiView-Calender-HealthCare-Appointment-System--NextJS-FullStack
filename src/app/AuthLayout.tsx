"use client";

/**
 * AuthLayout Component
 * 
 * This component handles conditional rendering based on authentication state:
 * - For auth pages (login, register, accept-invitation) when not logged in: Shows minimal layout without navbar
 * - For authenticated pages: Shows full app with Navbar, AuthGuard, and context providers
 * 
 * This pattern allows different layouts for public vs authenticated pages while maintaining
 * a single layout structure.
 */

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Navbar from "@/components/navbar/Navbar";
import AuthGuard from "@/components/AuthGuard";
import { DateProvider } from "@/context/DateContext";
import { cn } from "@/lib/utils";
import { Inter } from "next/font/google";
import { AppointmentColorProvider } from "@/context/AppointmentColorContext";

const inter = Inter({ subsets: ["latin"] });

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  // Get current route pathname to determine if we're on an auth page
  const pathname = usePathname();
  // Track current user state - used to conditionally render layout
  const [user, setUser] = useState<{ id: string; email: string } | null>(null);
  // Check authentication status on component mount
  // Uses dynamic import to reduce initial bundle size (code splitting)
  useEffect(() => {
    import("@supabase/auth-helpers-nextjs").then(({ createClientComponentClient }) => {
      const supabase = createClientComponentClient();
      // Get current authenticated user from Supabase
      supabase.auth.getUser().then(({ data }) => {
        if (data?.user) {
          setUser({ id: data.user.id, email: data.user.email ?? "" });
        } else {
          setUser(null);
        }
      });
    });
  }, []);

  // Determine if current route is an authentication page (login, register, accept invitation)
  // These pages should show minimal layout without navbar when user is not logged in
  const isAuthPage = ["/login", "/register", "/accept-invitation"].some((p) => pathname.startsWith(p));
  
  // Render minimal layout for auth pages when user is not logged in
  // This provides a cleaner experience for login/registration flows
  if (isAuthPage && !user) {
    return (
      <div className={cn("min-h-screen bg-gray-50 text-gray-900", inter.className)}>
        {children}
      </div>
    );
  }
  
  // Full app layout for authenticated users
  // Wraps children with:
  // - AuthGuard: Handles authentication checks and redirects
  // - AppointmentColorProvider: Manages color coding for appointments
  // - DateProvider: Manages current date state for calendar navigation
  // - Navbar: Main navigation component
  return (
    <div className={cn("min-h-screen bg-gray-50 text-gray-900", inter.className)}>
      <AuthGuard>
        <AppointmentColorProvider>
          <DateProvider>
            <Navbar />
            {children}
          </DateProvider>
        </AppointmentColorProvider>
      </AuthGuard>
    </div>
  );
}
