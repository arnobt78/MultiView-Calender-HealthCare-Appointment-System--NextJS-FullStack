"use client";

import { useLayoutEffect, useState } from "react";
import { usePathname } from "next/navigation";
import {
  beginAuthNavigation,
  clearAuthNavPendingIfArrived,
  isAuthNavPendingForPath,
} from "@/lib/auth-pending-toast";

/**
 * Button-level auth loading — sessionStorage-backed spinner; hard replace navigation
 * (no router.push) so authenticated /login is never soft-refetched mid-transition.
 */
export function useAuthNavButtonLoading(sourcePath: string) {
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);

  /** Sync read every render — survives remounts before effects run. */
  const pendingNav =
    typeof sessionStorage !== "undefined" && isAuthNavPendingForPath(sourcePath);
  const showLoading = loading || pendingNav;

  useLayoutEffect(() => {
    clearAuthNavPendingIfArrived(pathname);
  }, [pathname]);

  const startAuthNavigation = (dest: string) => {
    setLoading(true);
    beginAuthNavigation(sourcePath, dest);
  };

  return {
    loading: showLoading,
    setLoading,
    startAuthNavigation,
    /** Freeze Framer entrance animations during auth transition (prevents re-flash). */
    authTransitionActive: showLoading,
  };
}
