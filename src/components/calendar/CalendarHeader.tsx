"use client";

import { useDateContext } from "@/context/DateContext";
import { addDays } from "date-fns";
import { Button } from "@/components/ui/button";
import React, { useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  LayoutList,
  Calendar,
  Columns3,
  CalendarDays,
  FileUp,
  CalendarPlus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import AppointmentDialogController from "./AppointmentDialogController";
import ImportICSDialog from "./ImportICSDialog";

// View modes in display order
const views = ["List", "Day", "Week", "Month"] as const;
type ViewType = (typeof views)[number];

const VIEW_ICONS = {
  List: LayoutList,
  Day: Calendar,
  Week: Columns3,
  Month: CalendarDays,
} as const;

const tabBase =
  "inline-flex h-10 shrink-0 items-center gap-2 rounded-full border px-4 text-sm font-medium backdrop-blur-md transition-all duration-200 [&_svg]:size-4";

const tabInactive =
  "border-slate-300/55 bg-white/70 text-slate-700 shadow-[0_10px_24px_rgba(15,23,42,0.08)] hover:border-sky-300/60 hover:bg-sky-50/80 hover:text-sky-800 hover:shadow-[0_12px_30px_rgba(2,132,199,0.16)]";

const tabActive =
  "border-sky-500/55 bg-linear-to-r from-sky-600 to-sky-700 text-white shadow-[0_12px_36px_rgba(2,132,199,0.34)] hover:from-sky-600/95 hover:to-sky-700/95 hover:text-white active:text-white";

const violetGlassImport =
  "inline-flex h-10 shrink-0 items-center gap-2 rounded-full border border-violet-300/55 bg-violet-50/75 px-4 text-sm font-medium text-violet-700 shadow-[0_10px_24px_rgba(139,92,246,0.18)] backdrop-blur-md transition-all duration-200 hover:border-violet-400/60 hover:bg-violet-100/75 hover:text-violet-800 hover:shadow-[0_12px_30px_rgba(139,92,246,0.24)] [&_svg]:size-4";

const emeraldGlassPrimary =
  "inline-flex h-10 shrink-0 items-center gap-2 rounded-full border border-emerald-400/45 bg-linear-to-r from-emerald-600 to-emerald-700 px-4 text-sm font-medium text-white shadow-[0_10px_40px_rgba(16,185,129,0.42)] backdrop-blur-md transition-all duration-200 hover:from-emerald-500 hover:via-emerald-600 hover:to-emerald-700 hover:text-white hover:shadow-[0_14px_48px_rgba(16,185,129,0.58)] active:text-white [&_svg]:size-4";

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
        <div className="flex flex-wrap items-center gap-2">
          {views.map((v) => {
            const Icon = VIEW_ICONS[v];
            const isActive = v === view;
            return (
              <Button
                key={v}
                type="button"
                variant="ghost"
                size="lg"
                onClick={() => {
                  if (v === "List") {
                    // Reset date to today when switching to List
                    setCurrentDate(new Date());
                  }
                  setView(v);
                }}
                className={cn(
                  tabBase,
                  "cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/45 focus-visible:ring-offset-2",
                  isActive ? tabActive : tabInactive
                )}
              >
                <Icon className="shrink-0" aria-hidden />
                {v}
              </Button>
            );
          })}
        </div>
        {/* Import .ics button */}
        <ImportICSDialog
          trigger={
            <Button type="button" variant="ghost" size="lg" className={cn(violetGlassImport, "cursor-pointer")}>
              <FileUp className="shrink-0" aria-hidden />
              Import .ics
            </Button>
          }
        />

        {/* New Appointment button */}
        <AppointmentDialogController
          isOpen={shouldComposeOpen || isComposeOpen}
          onOpenChange={handleComposeOpenChange}
          trigger={
            <Button type="button" variant="ghost" size="lg" className={cn(emeraldGlassPrimary, "cursor-pointer")}>
              <CalendarPlus className="shrink-0" aria-hidden />
              New Appointment
            </Button>
          }
        />
      </div>

    </div>
  );
}
