"use client";

import { useDateContext } from "@/context/DateContext";
import {
  addDays,
  endOfWeek,
  isSameDay,
  isSameMonth,
  startOfWeek,
} from "date-fns";
import { Button } from "@/components/ui/button";
import React, { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import {
  LayoutList,
  Calendar,
  Columns3,
  CalendarDays,
  FileUp,
  CalendarPlus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  emeraldGlassPrimaryButtonClass,
  violetGlassImportButtonClass,
} from "@/lib/calendar-header-action-styles";
import AppointmentDialogController from "./AppointmentDialogController";
import ImportICSDialog from "./ImportICSDialog";
import { useAuth } from "@/hooks/useAuth";
import { useInitialNavRole } from "@/context/NavRoleContext";
import { isPatientRole } from "@/lib/rbac";
import { apiClient } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";
import { isValidUUID } from "@/lib/validation";

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
  "border-sky-500/55 bg-linear-to-r from-sky-500 to-sky-700 text-white shadow-[0_12px_36px_rgba(2,132,199,0.34)] hover:from-sky-600/95 hover:to-sky-700/95 hover:text-white active:text-white";

export default function CalendarHeader({
  view,
  setView,
}: {
  view: ViewType;
  setView: (v: ViewType) => void;
}) {
  const { currentDate, setCurrentDate } = useDateContext();
  const { user } = useAuth();
  const initialNavRole = useInitialNavRole();
  const queryClient = useQueryClient();
  // SSR `initialNavRole` + live auth — same rule as Navbar (no Import / New Appointment flash on refresh).
  const role = user?.role ?? initialNavRole;
  const isPatient = isPatientRole(role);

  /**
   * One lightweight GET per dashboard session: seeds `queryKeys.appointmentTypes.byDoctor(owner)` so the
   * compose dialog / slot strip can reuse cache (same `staleTime` as `AppointmentDialogGeneralSection`).
   */
  useEffect(() => {
    if (isPatient || !user?.id) return;
    if (!isValidUUID(user.id)) return;
    void queryClient.prefetchQuery({
      queryKey: queryKeys.appointmentTypes.byDoctor(user.id),
      queryFn: () =>
        apiClient<{ types: unknown[] }>(
          `/api/appointment-types?doctorId=${encodeURIComponent(user.id)}`
        ),
      staleTime: 5 * 60 * 1000,
    });
  }, [isPatient, user?.id, queryClient]);

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

  const showJumpToToday = useMemo(() => {
    if (view === "List") return false;
    const t = new Date();
    if (view === "Day") return !isSameDay(currentDate, t);
    if (view === "Week") {
      const ws = startOfWeek(currentDate, { weekStartsOn: 1 });
      const we = endOfWeek(currentDate, { weekStartsOn: 1 });
      return !(t >= ws && t <= we);
    }
    if (view === "Month") return !isSameMonth(currentDate, t);
    return false;
  }, [currentDate, view]);

  const jumpToToday = () => setCurrentDate(new Date());

  return (
    <div className="flex items-center justify-between py-3 px-2 sm:px-4 lg:px-8">

      {/* Date Navigation */}
      <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-2 gap-y-2 sm:gap-3">
        <div className="flex shrink-0 items-center gap-1 sm:gap-2">
          <Button
            variant="outline"
            onClick={handlePrev}
            disabled={view === "List"}
            className="cursor-pointer hover:bg-gray-100 transition-colors shadow-xl"
          >
            ←
          </Button>
          <div className="text-base font-medium text-gray-700">
            <span className="tracking-wide">
              {new Intl.DateTimeFormat("en-US", { weekday: "short" }).format(
                currentDate
              )}
              {", "}
            </span>
            <span className="">
              {new Intl.DateTimeFormat("en-US", {
                day: "2-digit",
                month: "long",
                year: "numeric",
              }).format(currentDate)}
            </span>
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
        {showJumpToToday && (
          <Button
            type="button"
            variant="ghost"
            onClick={jumpToToday}
            className="calendar-glass-badge calendar-glass-badge-blue group inline-flex h-auto min-w-0 max-w-full shrink items-center gap-1 whitespace-normal rounded-2xl text-left leading-snug cursor-pointer py-1 font-normal"
          >
            {view === "Day" && (
              <>
                <Calendar
                  className="size-3.5 shrink-0 text-sky-600 transition-colors group-hover:text-sky-700"
                  aria-hidden
                />
                <span className="text-sky-700 transition-colors group-hover:text-sky-800">
                  {"Go to today's calendar — day view"}
                </span>
              </>
            )}
            {view === "Week" && (
              <>
                <Columns3
                  className="size-3.5 shrink-0 text-sky-600 transition-colors group-hover:text-sky-700"
                  aria-hidden
                />
                <span className="text-sky-700 transition-colors group-hover:text-sky-800">
                  {"Go to this week's calendar — week view"}
                </span>
              </>
            )}
            {view === "Month" && (
              <>
                <CalendarDays
                  className="size-3.5 shrink-0 text-sky-600 transition-colors group-hover:text-sky-700"
                  aria-hidden
                />
                <span className="text-sky-700 transition-colors group-hover:text-sky-800">
                  {"Go to this month's calendar — month view"}
                </span>
              </>
            )}
          </Button>
        )}
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
        {/* Import .ics and New Appointment — hidden for patient role (read-only access) */}
        {!isPatient && (
          <ImportICSDialog
            trigger={
              <Button type="button" variant="ghost" size="lg" className={cn(violetGlassImportButtonClass, "cursor-pointer")}>
                <FileUp className="shrink-0" aria-hidden />
                Import .ics
              </Button>
            }
          />
        )}

        {!isPatient && (
          <AppointmentDialogController
            isOpen={shouldComposeOpen || isComposeOpen}
            onOpenChange={handleComposeOpenChange}
            trigger={
              <Button type="button" variant="ghost" size="lg" className={cn(emeraldGlassPrimaryButtonClass, "cursor-pointer")}>
                <CalendarPlus className="shrink-0" aria-hidden />
                New Appointment
              </Button>
            }
          />
        )}
      </div>

    </div>
  );
}
