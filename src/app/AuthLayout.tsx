"use client";

/**
 * AuthLayout Component
 *
 * Wraps the app with AppProviders (Query, Toast, Date, Color) and AuthLayoutInner.
 * AuthLayoutInner uses useAuth() to decide:
 * - Auth pages when not logged in: minimal layout (no navbar)
 * - Authenticated: full layout with AuthGuard and Navbar
 */

import { AppProviders } from "@/providers/AppProviders";
import { AuthLayoutInner } from "./AuthLayoutInner";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppProviders>
      <AuthLayoutInner>{children}</AuthLayoutInner>
    </AppProviders>
  );
}
