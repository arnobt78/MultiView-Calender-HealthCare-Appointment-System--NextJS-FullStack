"use client";

import { useDateContext } from "@/context/DateContext";
import { format, addDays } from "date-fns";
import { de } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import React from "react";
import AppointmentDialogTrigger from "./AppointmentDialogTrigger";

// Change tab order to List, Week, Month
const views = ["List", "Week", "Month"] as const;
type ViewType = (typeof views)[number];

export default function CalendarHeader({
  view,
  setView,
}: {
  view: ViewType;
  setView: (v: ViewType) => void;
}) {
  const { currentDate, setCurrentDate } = useDateContext();

  // Navigation logic: only change date for Month/Week, not for List
  const handlePrev = () => {
    if (view === "Month") setCurrentDate(addDays(currentDate, -30));
    else if (view === "Week") setCurrentDate(addDays(currentDate, -7));
    // For List, do nothing or optionally disable
  };
  const handleNext = () => {
    if (view === "Month") setCurrentDate(addDays(currentDate, 30));
    else if (view === "Week") setCurrentDate(addDays(currentDate, 7));
    // For List, do nothing or optionally disable
  };

  return (
    <div className="flex items-center justify-between py-4 px-2 sm:px-4 lg:px-8">
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          onClick={handlePrev}
          disabled={view === "List"}
          className="cursor-pointer hover:bg-gray-100 transition-colors shadow-xl"
        >
          ←
        </Button>
        <div className="text-lg font-medium ">
          {format(currentDate, "dd. MMMM yyyy", { locale: de })}
        </div>
        <Button
          variant="outline"
          onClick={handleNext}
          disabled={view === "List"}
          className="cursor-pointer hover:bg-gray-100 transition-colors"
        >
          →
        </Button>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex gap-2">
          {views.map((v) => (
            <Button
              key={v}
              onClick={() => {
                if (v === "List") {
                  // Reset date to today when switching to List
                  setCurrentDate(new Date());
                }
                setView(v);
              }}
              variant={v === view ? "default" : "outline"}
              className="cursor-pointer transition-colors shadow-xl"
            >
              {v}
            </Button>
          ))}
        </div>
        {/* Restore + Neuer Termin button */}
        <AppointmentDialogTrigger
          trigger={<Button variant="default" className="cursor-pointer shadow-xl">+ New Appointment</Button>}
        />
      </div>
    </div>
  );
}
