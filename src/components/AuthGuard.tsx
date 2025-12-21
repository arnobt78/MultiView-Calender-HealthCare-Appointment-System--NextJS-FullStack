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

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

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
  // Track if authentication check has completed (prevents flash of content)
  const [checked, setChecked] = useState(false);
  // Store current authenticated user
  const [user, setUser] = useState<User | null>(null);

  // Authentication check runs on mount and when pathname changes
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/auth/me");
        const data = await response.json();
        
        if (response.ok && data.user) {
          setUser(data.user);
          setChecked(true);
          
          // Email verification check: Users must verify their email before accessing the app
          // If email is not verified, redirect to login with verification message
          if (!data.user.email_verified && !ALLOWED_PATHS.includes(pathname)) {
            router.replace("/login?verify=1");
            return;
          }
          
          // UX: If user is already logged in and tries to access login/register pages,
          // redirect them to the main app (but allow /accept-invitation to work)
          if (
            data.user.email_verified &&
            ["/login", "/register"].includes(pathname)
          ) {
            router.replace("/");
          }
        } else {
          // Not authenticated
          setUser(null);
          setChecked(true);
          
          // Security: Redirect unauthenticated users to login if they're trying to access protected routes
          if (!ALLOWED_PATHS.includes(pathname)) {
            router.replace("/login");
          }
        }
      } catch (error) {
        console.error("Auth check error:", error);
        setUser(null);
        setChecked(true);
        
        // On error, redirect to login for protected routes
        if (!ALLOWED_PATHS.includes(pathname)) {
          router.replace("/login");
        }
      }
    };

    checkAuth();
  }, [pathname, router]);

  // Show nothing while checking authentication for protected routes
  // This prevents flash of content before redirect
  if (!checked && !ALLOWED_PATHS.includes(pathname)) {
    return null;
  }
  
  // Render children only after authentication check is complete
  return <>{children}</>;
}
