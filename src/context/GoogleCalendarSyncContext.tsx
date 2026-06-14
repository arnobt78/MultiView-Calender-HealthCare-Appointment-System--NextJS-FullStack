"use client";

/**
 * Single useGoogleCalendar() instance for staff — sync actions shared by calendar cards,
 * CP appointment list, and detail footer without N hook subscriptions.
 */

import { createContext, useContext, useMemo, type ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useGoogleCalendar } from "@/hooks/useGoogleCalendar";
import { useAuth } from "@/hooks/useAuth";
import { isAdminRole, isDoctorRole } from "@/lib/rbac";
import { queryKeys } from "@/lib/query-keys";
import type { GoogleCalendarStatus } from "@/types/google-calendar";

export type GoogleCalendarSyncContextValue = {
  isConnected: boolean;
  syncToGoogle: (appointmentId: string) => void;
  syncingAppointmentId: string | null;
};

const disconnectedDefaults: GoogleCalendarSyncContextValue = {
  isConnected: false,
  syncToGoogle: () => {},
  syncingAppointmentId: null,
};

const GoogleCalendarSyncContext = createContext<GoogleCalendarSyncContextValue | null>(
  null
);

export function GoogleCalendarSyncProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const role = user?.role ?? null;
  const isStaff = isAdminRole(role) || isDoctorRole(role);
  const calendar = useGoogleCalendar();

  const value = useMemo<GoogleCalendarSyncContextValue>(
    () => ({
      isConnected: calendar.isConnected,
      syncToGoogle: calendar.syncToGoogle,
      syncingAppointmentId: calendar.syncingAppointmentId,
    }),
    [calendar.isConnected, calendar.syncToGoogle, calendar.syncingAppointmentId]
  );

  if (!isStaff) {
    return <>{children}</>;
  }

  return (
    <GoogleCalendarSyncContext.Provider value={value}>
      {children}
    </GoogleCalendarSyncContext.Provider>
  );
}

/** Calendar cards / optional surfaces — SSR cache fallback until provider mounts. */
export function useGoogleCalendarSyncOptional(): GoogleCalendarSyncContextValue {
  const ctx = useContext(GoogleCalendarSyncContext);
  const queryClient = useQueryClient();

  if (ctx) return ctx;

  const statusKey = [...queryKeys.googleCalendar.root, "status"] as const;
  const status = queryClient.getQueryData<GoogleCalendarStatus>(statusKey);

  return {
    isConnected: status?.connected ?? false,
    syncToGoogle: disconnectedDefaults.syncToGoogle,
    syncingAppointmentId: null,
  };
}
