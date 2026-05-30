"use client";

/**
 * Seeds TanStack Query with SSR-prefetched CP user lists before tab paint.
 * Mounted once in control-panel/layout.tsx — all section pages share warm cache.
 */

import { useLayoutEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import type { UsersListResponse } from "@/hooks/useUsers";
import { seedUsersListCache } from "@/lib/ssr-query-seed";
import {
  CP_ALL_USERS_FILTERS,
  CP_DOCTOR_USERS_FILTERS,
} from "@/lib/control-panel-users-filters";

type ControlPanelSsrCacheSeedProps = {
  initialDoctorUsers?: UsersListResponse | null;
  initialAllUsers?: UsersListResponse | null;
};

export default function ControlPanelSsrCacheSeed({
  initialDoctorUsers,
  initialAllUsers,
}: ControlPanelSsrCacheSeedProps) {
  const queryClient = useQueryClient();

  useLayoutEffect(() => {
    if (initialDoctorUsers != null) {
      seedUsersListCache(queryClient, CP_DOCTOR_USERS_FILTERS, initialDoctorUsers);
    }
    if (initialAllUsers != null) {
      seedUsersListCache(queryClient, CP_ALL_USERS_FILTERS, initialAllUsers);
    }
  }, [queryClient, initialDoctorUsers, initialAllUsers]);

  return null;
}
