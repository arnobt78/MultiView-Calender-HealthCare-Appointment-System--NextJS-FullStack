"use client";

/**
 * AuthGuard Component
 * 
 * This component acts as a route guard that:
 * 1. Checks if user is authenticated
 * 2. Redirects unauthenticated users to login
 * 3. Validates email confirmation status
 * 4. Manages redirects for authenticated users on auth pages
 * 
 * This is a critical security component that protects routes and ensures
 * only authenticated users can access the main application.
 */

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

// Routes that don't require authentication - users can access these without being logged in
const ALLOWED_PATHS = ["/login", "/register", "/accept-invitation"];

interface User {
  id: string;
  email: string;
  display_name?: string;
  role?: string;
  email_verified: boolean;
}

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  // Use our new central auth hook
  const { user, isLoading, isAuthenticated } = useAuth();

  // Handle redirects side-effects
  useEffect(() => {
    // Wait until the hook is done loading
    if (isLoading) return;

    if (isAuthenticated && user) {
      // Email verification check
      if (user.email_verified === false && !ALLOWED_PATHS.includes(pathname)) {
        router.replace("/login?verify=1");
        return;
      }

      // UX: redirect from auth pages if logged in
      if (user.email_verified !== false && ["/login", "/register"].includes(pathname)) {
        router.replace("/");
        return;
      }
    } else {
      // Security: Redirect unauthenticated users
      if (!ALLOWED_PATHS.includes(pathname)) {
        router.replace("/login");
        return;
      }
    }
  }, [isLoading, isAuthenticated, user, pathname, router]);

  // Show nothing while checking authentication to prevent flash of content
  if (isLoading || (!isAuthenticated && !ALLOWED_PATHS.includes(pathname))) {
    return null;
  }

  // Render children only after authentication check is complete
  return <>{children}</>;
}
