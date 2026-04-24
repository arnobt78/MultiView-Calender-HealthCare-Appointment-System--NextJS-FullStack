"use client";

import { useDateContext } from "@/context/DateContext";
import { addDays } from "date-fns";
import { Button } from "@/components/ui/button";
import React, { useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import AppointmentDialogController from "./AppointmentDialogController";
import ImportICSDialog from "./ImportICSDialog";

// View modes in display order
const views = ["List", "Day", "Week", "Month"] as const;
type ViewType = (typeof views)[number];

export default function CalendarHeader({
  view,
  setView,
}: {
  view: ViewType;
  setView: (v: ViewType) => void;
}) {
  const { currentDate, setCurrentDate } = useDateContext();
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const shouldComposeOpen = searchParams.get("compose") === "1";

  const handleComposeOpenChange = (open: boolean) => {
    setIsComposeOpen(open);
    if (!open && shouldComposeOpen) {
      const next = new URLSearchParams(searchParams.toString());
      next.delete("compose");
      const query = next.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    }
  };

  // Navigation logic: only change date for Month/Week/Day, not for List
  const handlePrev = () => {
    if (view === "Month") setCurrentDate(addDays(currentDate, -30));
    else if (view === "Week") setCurrentDate(addDays(currentDate, -7));
    else if (view === "Day") setCurrentDate(addDays(currentDate, -1));
    // For List, do nothing
  };
  const handleNext = () => {
    if (view === "Month") setCurrentDate(addDays(currentDate, 30));
    else if (view === "Week") setCurrentDate(addDays(currentDate, 7));
    else if (view === "Day") setCurrentDate(addDays(currentDate, 1));
    // For List, do nothing
  };

  return (
    <div className="flex items-center justify-between py-4 px-2 sm:px-4 lg:px-8">

      {/* Date Navigation */}
      <div className="flex items-center gap-4 ">
        <Button
          variant="outline"
          onClick={handlePrev}
          disabled={view === "List"}
          className="cursor-pointer hover:bg-gray-100 transition-colors shadow-xl"
        >
          ←
        </Button>
        <div className="text-lg font-medium text-gray-700">
          {new Intl.DateTimeFormat("de-DE", {
            day: "2-digit",
            month: "long",
            year: "numeric",
          }).format(currentDate)}
        </div>
        <Button
          variant="outline"
          onClick={handleNext}
          disabled={view === "List"}
          className="cursor-pointer hover:bg-gray-100 transition-colors shadow-xl"
        >
          →
        </Button>
      </div>

      {/* View Navigation */}
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
        {/* Import .ics button */}
        <ImportICSDialog
          trigger={
            <Button variant="outline" className="cursor-pointer shadow-xl">
              Import .ics
            </Button>
          }
        />

        {/* New Appointment button */}
        <AppointmentDialogController
          isOpen={shouldComposeOpen || isComposeOpen}
          onOpenChange={handleComposeOpenChange}
          trigger={<Button variant="default" className="cursor-pointer shadow-xl">+ New Appointment</Button>}
        />
      </div>

    </div>
  );
}
