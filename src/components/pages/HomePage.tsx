"use client";

// HomePage — main calendar area.  View mode is kept in the URL as ?view=list|day|week|month
// so a refresh returns to the same tab.

import React, { useCallback } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
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
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const view = parseViewParam(searchParams.get("view"));

  const setView = useCallback(
    (v: ViewType) => {
      if (v === view) return;
      const p = new URLSearchParams(searchParams.toString());
      p.set("view", v.toLowerCase());
      const q = p.toString();
      router.replace(q ? `${pathname}?${q}` : pathname, { scroll: false });
    },
    [router, pathname, searchParams, view]
  );

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col overflow-visible">
      <div className="shrink-0">
        <CalendarHeader view={view} setView={setView} />
      </div>
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
