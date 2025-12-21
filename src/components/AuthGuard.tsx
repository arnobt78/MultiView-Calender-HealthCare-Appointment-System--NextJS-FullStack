"use client";

/**
 * AuthGuard Component
 * 
 * This component acts as a route guard that:
 * 1. Checks if user is authenticated
 * 2. Redirects unauthenticated users to login
 * 3. Validates email confirmation status
 * 4. Handles automatic user upsert to database
 * 5. Manages redirects for authenticated users on auth pages
 * 
 * This is a critical security component that protects routes and ensures
 * only authenticated users can access the main application.
 */

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

// Routes that don't require authentication - users can access these without being logged in
const ALLOWED_PATHS = ["/login", "/register", "/accept-invitation"];

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  // Track if authentication check has completed (prevents flash of content)
  const [checked, setChecked] = useState(false);
  // Store current authenticated user
  const [user, setUser] = useState<import('@supabase/supabase-js').User | null>(null);

  // Authentication check runs on mount and when pathname changes
  useEffect(() => {
    const supabase = createClientComponentClient();
    supabase.auth.getUser().then(
      async ({ data }: Awaited<ReturnType<typeof supabase.auth.getUser>>) => {
        setUser(data?.user || null);
        setChecked(true);
        
        // Security: Redirect unauthenticated users to login if they're trying to access protected routes
        if (!data?.user && !ALLOWED_PATHS.includes(pathname)) {
          router.replace("/login");
          return;
        }
        
        // Email verification check: Users must verify their email before accessing the app
        // If email is not confirmed, sign them out and redirect to login with verification message
        if (data?.user && !data.user.email_confirmed_at && !ALLOWED_PATHS.includes(pathname)) {
          await supabase.auth.signOut();
          router.replace("/login?verify=1");
          return;
        }
        
        // UX: If user is already logged in and tries to access login/register pages,
        // redirect them to the main app (but allow /accept-invitation to work)
        if (
          data?.user &&
          data.user.email_confirmed_at &&
          ["/login", "/register"].includes(pathname)
        ) {
          router.replace("/");
        }
        
        // Data sync: Ensure user record exists in our users table
        // Uses upsert (update or insert) to handle both new and existing users
        // This keeps our database in sync with Supabase Auth
        if (data?.user && data.user.email_confirmed_at) {
          const { id, email } = data.user;
          if (id && email) {
            await supabase.from("users").upsert({ id, email }, { onConflict: "id" });
          }
        }
      }
    );
  }, [pathname, router]);

  // Show nothing while checking authentication for protected routes
  // This prevents flash of content before redirect
  if (!checked && !ALLOWED_PATHS.includes(pathname)) {
    return null;
  }
  
  // Render children only after authentication check is complete
  return <>{children}</>;
}
