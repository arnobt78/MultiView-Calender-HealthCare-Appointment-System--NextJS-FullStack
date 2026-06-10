"use client";

import { useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  seedAuthMeCacheFromSsr,
  type NavSsrUser,
} from "@/lib/nav-session-ssr-seed";

/** Sync auth/me cache before Navbar subscribes — avoids robohash flash on hard refresh. */
export function NavSessionSsrSeed({ user }: { user: NavSsrUser | null }) {
  const queryClient = useQueryClient();

  useMemo(() => {
    seedAuthMeCacheFromSsr(queryClient, user);
    return null;
  }, [queryClient, user]);

  return null;
}
