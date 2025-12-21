"use client";

// HomePage Component - Main calendar view page
// This component manages the three different calendar view modes:
// - Liste (List View): Shows appointments in a list format grouped by date
// - Woche (Week View): Shows appointments in a weekly calendar grid
// - Monat (Month View): Shows appointments in a monthly calendar grid

import React, { useState } from "react";

import MonthView from "@/components/calendar/MonthView";
import WeekView from "@/components/calendar/WeekView";
import AppointmentList from "@/components/calendar/AppointmentList";
import CalendarHeader from "@/components/calendar/CalendarHeader";

// Type definition for the three available calendar view modes
type ViewType = "Liste" | "Woche" | "Monat";

const HomePage: React.FC = () => {
  // State to track which calendar view is currently active
  // Default view is "Liste" (List View)
  const [view, setView] = useState<ViewType>("Liste");

  return (
    <div className="min-h-screen bg-background">
      <div className="p-4 space-y-4">
        {/* CalendarHeader component provides view switching buttons and date navigation */}
        <CalendarHeader view={view} setView={setView} />

        {/* Conditional rendering based on selected view
            Only the active view component is rendered to optimize performance */}
        {view === "Liste" && <AppointmentList />}
        {view === "Woche" && <WeekView />}
        {view === "Monat" && <MonthView />}
      </div>
    </div>
  );
};

export default HomePage;
