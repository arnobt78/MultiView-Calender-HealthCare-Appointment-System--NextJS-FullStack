"use client";

/**
 * Seeds TanStack Query with SSR-prefetched CP user lists before tab paint.
 * Mounted once in control-panel/layout.tsx — all section pages share warm cache.
 */

import { useLayoutEffect, useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import type { UsersListResponse } from "@/hooks/useUsers";
import type { Invoice } from "@/hooks/usePayments";
import { seedUsersListCache } from "@/lib/ssr-query-seed";
import { seedInvoicesListCacheFromSsr } from "@/lib/invoices-query-ssr-seed";
import {
  CP_ADMIN_USERS_FILTERS,
  CP_ALL_USERS_FILTERS,
  CP_DOCTOR_USERS_FILTERS,
} from "@/lib/control-panel-users-filters";

type ControlPanelSsrCacheSeedProps = {
  initialDoctorUsers?: UsersListResponse | null;
  initialAdminUsers?: UsersListResponse | null;
  initialAllUsers?: UsersListResponse | null;
  initialInvoices?: Invoice[] | null;
};

export default function ControlPanelSsrCacheSeed({
  initialDoctorUsers,
  initialAdminUsers,
  initialAllUsers,
  initialInvoices,
}: ControlPanelSsrCacheSeedProps) {
  const queryClient = useQueryClient();

  useMemo(() => {
    seedInvoicesListCacheFromSsr(queryClient, initialInvoices ?? undefined);
    return null;
  }, [queryClient, initialInvoices]);

  useLayoutEffect(() => {
    if (initialDoctorUsers != null) {
      seedUsersListCache(queryClient, CP_DOCTOR_USERS_FILTERS, initialDoctorUsers);
    }
    if (initialAdminUsers != null) {
      seedUsersListCache(queryClient, CP_ADMIN_USERS_FILTERS, initialAdminUsers);
    }
    if (initialAllUsers != null) {
      seedUsersListCache(queryClient, CP_ALL_USERS_FILTERS, initialAllUsers);
    }
    seedInvoicesListCacheFromSsr(queryClient, initialInvoices ?? undefined);
  }, [queryClient, initialDoctorUsers, initialAdminUsers, initialAllUsers, initialInvoices]);

  return null;
}
