"use client";

// HomePage — main calendar area.  View mode is kept in the URL as ?view=list|day|week|month
// so a refresh returns to the same tab.
//
// SSR initial-data seeding:
// dashboard/page.tsx (server) pre-fetches categories and patients via Prisma and
// passes them as initialCategories / initialPatients props. useLayoutEffect seeds
// those arrays into the TanStack Query cache under queryKeys.categories.all and
// queryKeys.patients.all before the first paint. useAppointments internally calls
// ensureQueryData on these keys — finding them already in cache avoids the
// sub-fetch waterfall and lets the appointments fetch fire immediately.

import React, { useCallback, useEffect, useLayoutEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import MonthView from "@/components/calendar/MonthView";
import WeekView from "@/components/calendar/WeekView";
import DayView from "@/components/calendar/DayView";
import AppointmentList from "@/components/calendar/AppointmentList";
import CalendarHeader from "@/components/calendar/CalendarHeader";
import type { Category, Patient } from "@/types/types";

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
};

const HomePage: React.FC<HomePageProps> = ({ initialCategories, initialPatients }) => {
  const queryClient = useQueryClient();

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
  }, [queryClient, initialCategories, initialPatients]);
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
  );
};

export default HomePage;
