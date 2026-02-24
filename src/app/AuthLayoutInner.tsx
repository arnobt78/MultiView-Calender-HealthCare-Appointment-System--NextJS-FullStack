"use client";

/**
 * Inner layout that uses useAuth() (must be inside QueryProvider).
 * Decides between minimal layout (auth pages when not logged in) and full app layout.
 */

import { usePathname } from "next/navigation";
import Navbar from "@/components/navbar/Navbar";
import AuthGuard from "@/components/AuthGuard";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export function AuthLayoutInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, isLoading } = useAuth();

  const isAuthPage = ["/login", "/register", "/accept-invitation"].some((p) =>
    pathname.startsWith(p)
  );

  if (isAuthPage && !user && !isLoading) {
    return (
      <div className={cn("min-h-screen bg-gray-50 text-gray-900", inter.className)}>
        {children}
      </div>
    );
  }

  return (
    <div className={cn("min-h-screen bg-gray-50 text-gray-900", inter.className)}>
      <AuthGuard>
        <Navbar />
        {children}
      </AuthGuard>
    </div>
  );
}
