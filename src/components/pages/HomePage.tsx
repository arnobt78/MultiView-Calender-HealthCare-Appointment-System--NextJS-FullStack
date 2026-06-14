"use client";

// HomePage — main calendar area.  View mode is kept in the URL as ?view=list|day|week|month
// so a refresh returns to the same tab.
//
// SSR initial-data seeding:
// dashboard/page.tsx pre-fetches categories, patients, assignees, and the merged
// FullAppointment[] list. useLayoutEffect seeds TanStack Query before paint so
// useAppointments / useAppointmentData find warm cache — no calendar flash.

import React, { useCallback, useEffect, useLayoutEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import MonthView from "@/components/calendar/MonthView";
import WeekView from "@/components/calendar/WeekView";
import DayView from "@/components/calendar/DayView";
import AppointmentList from "@/components/calendar/AppointmentList";
import CalendarHeader from "@/components/calendar/CalendarHeader";
import { ClinicianInvoiceDialogShell } from "@/components/shared/billing/ClinicianInvoiceDialogShell";
import type { Category, Patient, AppointmentAssignee } from "@/types/types";
import type { FullAppointment } from "@/hooks/useAppointments";
import type { DashboardAccessRow } from "@/lib/query-fetchers";
import type { Invoice } from "@/hooks/usePayments";
import type { GoogleCalendarStatus } from "@/types/google-calendar";
import { seedInvoicesListCacheFromSsr } from "@/lib/invoices-query-ssr-seed";
import { seedGoogleCalendarStatusCacheFromSsr } from "@/lib/cp-list-query-ssr-seed";

const views = ["List", "Day", "Week", "Month"] as const;
export type ViewType = (typeof views)[number];

function parseViewParam(v: string | null): ViewType {
  if (!v) return "List";
  const t = v.charAt(0).toUpperCase() + v.slice(1).toLowerCase();
  return (views as readonly string[]).includes(t) ? (t as ViewType) : "List";
}

type HomePageProps = {
  /** Server-prefetched categories — seeds queryKeys.categories.all before first render. */
  initialCategories?: Category[] | null;
  /** Server-prefetched patients — seeds queryKeys.patients.all before first render. */
  initialPatients?: Patient[] | null;
  /** Server-prefetched assignees — seeds queryKeys.assignees.all for calendar join. */
  initialAssignees?: AppointmentAssignee[] | null;
  /** Server-prefetched merged calendar rows — seeds queryKeys.appointments.all. */
  initialAppointments?: FullAppointment[] | null;
  /** Accepted dashboard shares — seeds queryKeys.dashboardAccess.accepted for useAppointments. */
  initialDashboardAccessAccepted?: DashboardAccessRow[] | null;
  /** SSR invoice list — calendar appointment invoice badges (useAppointmentInvoiceDisplayMap). */
  initialInvoices?: Invoice[] | null;
  /** Staff Google Calendar connection flag — seeds sync menu visibility on calendar cards. */
  initialGoogleCalendarStatus?: GoogleCalendarStatus | null;
};

const HomePage: React.FC<HomePageProps> = ({
  initialCategories,
  initialPatients,
  initialAssignees,
  initialAppointments,
  initialDashboardAccessAccepted,
  initialInvoices,
  initialGoogleCalendarStatus,
}) => {
  const queryClient = useQueryClient();

  useMemo(() => {
    seedInvoicesListCacheFromSsr(queryClient, initialInvoices ?? undefined);
    return null;
  }, [queryClient, initialInvoices]);

  /**
   * Seed the TanStack Query cache with server-prefetched data.
   * useLayoutEffect runs synchronously after DOM mutations but before paint,
   * so hooks that read these keys on the same render cycle find the data already
   * populated — no extra fetches, no skeleton flash on first load.
   */
  useLayoutEffect(() => {
    if (initialCategories != null) {
      queryClient.setQueryData(queryKeys.categories.all, initialCategories);
    }
    if (initialPatients != null) {
      queryClient.setQueryData(queryKeys.patients.all, initialPatients);
    }
    if (initialAssignees != null) {
      queryClient.setQueryData(queryKeys.assignees.all, initialAssignees);
    }
    if (initialAppointments != null) {
      queryClient.setQueryData(queryKeys.appointments.all, initialAppointments);
    }
    if (initialDashboardAccessAccepted != null) {
      queryClient.setQueryData(
        queryKeys.dashboardAccess.accepted,
        initialDashboardAccessAccepted
      );
    }
    seedInvoicesListCacheFromSsr(queryClient, initialInvoices ?? undefined);
    seedGoogleCalendarStatusCacheFromSsr(queryClient, initialGoogleCalendarStatus ?? undefined);
  }, [
    queryClient,
    initialCategories,
    initialPatients,
    initialAssignees,
    initialAppointments,
    initialDashboardAccessAccepted,
    initialInvoices,
    initialGoogleCalendarStatus,
  ]);
  const searchParams = useSearchParams();
  const initialView = useMemo(
    () => parseViewParam(searchParams.get("view")),
    [searchParams]
  );
  const [view, setViewState] = useState<ViewType>(initialView);

  useEffect(() => {
    const onPopState = () => {
      const params = new URLSearchParams(window.location.search);
      setViewState(parseViewParam(params.get("view")));
    };

    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  const setView = useCallback(
    (v: ViewType) => {
      if (v === view) return;
      setViewState(v);
      const p = new URLSearchParams(
        typeof window === "undefined" ? searchParams.toString() : window.location.search
      );
      p.set("view", v.toLowerCase());
      const q = p.toString();
      if (typeof window !== "undefined") {
        const nextUrl = q ? `${window.location.pathname}?${q}` : window.location.pathname;
        window.history.replaceState(window.history.state, "", nextUrl);
      }
    },
    [searchParams, view]
  );

  return (
    <ClinicianInvoiceDialogShell initialInvoices={initialInvoices}>
      <div className="flex h-full min-h-0 flex-1 flex-col overflow-visible">
        <div className="shrink-0">
          <CalendarHeader view={view} setView={setView} />
        </div>
        {/* Only the calendar stack scrolls here (dashboard is height-locked); thin track via globals.css — rest of app scrolls the document. */}
        <div className="inner-dashboard-scroll flex min-h-0 flex-1 flex-col overflow-x-hidden overflow-y-auto overscroll-contain">
          {view === "List" && <AppointmentList />}
          {view === "Day" && <DayView />}
          {view === "Week" && <WeekView />}
          {view === "Month" && <MonthView />}
        </div>
      </div>
    </ClinicianInvoiceDialogShell>
  );
};

export default HomePage;
