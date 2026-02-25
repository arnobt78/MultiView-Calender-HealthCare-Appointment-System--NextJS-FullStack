"use client";

// HomePage Component - Main calendar view page
// Manages the three different calendar view modes:
// - List (List View): Shows appointments in a list format grouped by date
// - Week (Week View): Shows appointments in a weekly calendar grid
// - Month (Month View): Shows appointments in a monthly calendar grid

import React, { useState } from "react";

import MonthView from "@/components/calendar/MonthView";
import WeekView from "@/components/calendar/WeekView";
import AppointmentList from "@/components/calendar/AppointmentList";
import CalendarHeader from "@/components/calendar/CalendarHeader";

// Type definition for the three available calendar view modes
type ViewType = "List" | "Week" | "Month";

const HomePage: React.FC = () => {
  // State to track which calendar view is currently active
  // Default view is "List" (List View)
  const [view, setView] = useState<ViewType>("List");

  return (
    <div className="min-h-screen bg-background">
      {/* <div className="p-4 space-y-4"> */}
      {/* CalendarHeader component provides view switching buttons and date navigation */}
      <CalendarHeader view={view} setView={setView} />

      {/* Conditional rendering based on selected view
            Only the active view component is rendered to optimize performance */}
      {view === "List" && <AppointmentList />}
      {view === "Week" && <WeekView />}
      {view === "Month" && <MonthView />}
      {/* </div> */}
    </div>
  );
};

export default HomePage;
