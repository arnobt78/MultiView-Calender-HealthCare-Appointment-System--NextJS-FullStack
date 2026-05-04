"use client";

// HomePage — main calendar area.  View mode is kept in the URL as ?view=list|day|week|month
// so a refresh returns to the same tab.

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import MonthView from "@/components/calendar/MonthView";
import WeekView from "@/components/calendar/WeekView";
import DayView from "@/components/calendar/DayView";
import AppointmentList from "@/components/calendar/AppointmentList";
import CalendarHeader from "@/components/calendar/CalendarHeader";

const views = ["List", "Day", "Week", "Month"] as const;
export type ViewType = (typeof views)[number];

function parseViewParam(v: string | null): ViewType {
  if (!v) return "List";
  const t = v.charAt(0).toUpperCase() + v.slice(1).toLowerCase();
  return (views as readonly string[]).includes(t) ? (t as ViewType) : "List";
}

const HomePage: React.FC = () => {
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
