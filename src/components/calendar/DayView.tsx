"use client";

import { useMemo } from "react";
import { format, isSameDay } from "date-fns";
import Link from "next/link";
import { useAppointmentData } from "@/context/AppointmentDataContext";
import {
  useCalendarFilters,
  applyCalendarFilters,
} from "@/context/CalendarFiltersContext";
import { useDateContext } from "@/context/DateContext";
import { useAppointmentColor } from "@/context/AppointmentColorContext";
import { useCategories } from "@/hooks/useCategories";
import { usePatients } from "@/hooks/usePatients";
import { useRelatives } from "@/hooks/useRelatives";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import VideoCall from "./VideoCall";
import GlobalCalendarFilters from "./GlobalCalendarFilters";
import type { Appointment } from "@/types/types";

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const SLOT_HEIGHT = 64; // px per hour

export default function DayView() {
  const { currentDate } = useDateContext();
  const { appointments, isLoading } = useAppointmentData();
  const { category, patient, date, status, month, search } = useCalendarFilters();
  const { categories = [] } = useCategories();
  const { patients = [] } = usePatients();
  const { relatives = [] } = useRelatives();
  const { randomBgColor } = useAppointmentColor();
  const filteredAppointments = useMemo(
    () =>
      applyCalendarFilters(
        appointments,
        { category, patient, date, status, month, search },
        patients,
        relatives
      ),
    [appointments, category, patient, date, status, month, search, patients, relatives]
  );

  const dayAppointments = useMemo(() => {
    if (!filteredAppointments) return [];
    return filteredAppointments.filter((a: Appointment) => isSameDay(new Date(a.start), currentDate));
  }, [filteredAppointments, currentDate]);
  const dayStats = useMemo(() => {
    return dayAppointments.reduce(
      (acc, appt) => {
        if (appt.status === "done") acc.done += 1;
        else if (appt.status === "alert") acc.alert += 1;
        else acc.open += 1;
        return acc;
      },
      { open: 0, alert: 0, done: 0 }
    );
  }, [dayAppointments]);

  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const isToday = isSameDay(now, currentDate);
  const timeLineTopPx = isToday ? (currentMinutes / 60) * SLOT_HEIGHT : 0;

  if (isLoading) {
    return (
      <div className="px-2 sm:px-4 lg:px-8 py-4 space-y-2">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="flex gap-3 items-center">
            <Skeleton className="h-5 w-12 shrink-0" />
            <Skeleton className="h-14 flex-1 rounded-lg" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="min-h-0 px-2 py-4 sm:px-4 lg:px-8">
      {/* Day header */}
      <div className="mb-3 flex flex-wrap items-center gap-3">
        <h2 className="text-xl font-semibold">{format(currentDate, "EEEE, MMMM d, yyyy")}</h2>
        <Badge variant="outline" className="min-h-6 min-w-[90px] justify-center border-transparent bg-green-100 text-green-700 hover:bg-green-100">
          Today: {dayAppointments.length}
        </Badge>
        <span className="px-1 text-xs font-semibold text-gray-500">Status:</span>
        <Badge variant="outline" className="min-h-6 min-w-[90px] justify-center border-transparent bg-amber-100 text-amber-700 hover:bg-amber-100">
          Open: {dayStats.open}
        </Badge>
        <Badge variant="outline" className="min-h-6 min-w-[90px] justify-center border-transparent bg-rose-100 text-rose-700 hover:bg-rose-100">
          Alert: {dayStats.alert}
        </Badge>
        <Badge variant="outline" className="min-h-6 min-w-[90px] justify-center border-transparent bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
          Done: {dayStats.done}
        </Badge>
      </div>
      <GlobalCalendarFilters categories={categories} patients={patients} className="mb-3" />

      {/* Time grid */}
      <div className="relative border rounded-2xl overflow-hidden bg-background">
        {/* Current time indicator */}
        {isToday && (
          <div
            className="absolute left-0 right-0 z-20 flex items-center pointer-events-none"
            style={{ top: timeLineTopPx }}
          >
            <span className="w-14 text-[11px] text-red-500 font-semibold text-right pr-1.5 shrink-0">
              {format(now, "HH:mm")}
            </span>
            <div className="flex-1 border-t-2 border-red-500" />
          </div>
        )}

        {HOURS.map((hour) => {
          const slotAppts = dayAppointments.filter(
            (a: Appointment) => new Date(a.start).getHours() === hour
          );

          return (
            <div
              key={hour}
              className="flex border-b last:border-0 min-h-16"
            >
              {/* Hour label */}
              <div className="w-14 shrink-0 text-[11px] text-muted-foreground text-right pr-2 pt-1">
                {hour === 0 ? "" : `${String(hour).padStart(2, "0")}:00`}
              </div>

              {/* Slot area */}
              <div className="flex-1 border-l relative">
                {/* Half-hour dashed line */}
                <div className="absolute left-0 right-0 top-1/2 border-dashed border-t border-muted-foreground/15 pointer-events-none" />

                {slotAppts.length > 0 && (
                  <div className="flex flex-col gap-1 p-1">
                    {slotAppts.map((appt: Appointment) => {
                      const start = new Date(appt.start);
                      const end = new Date(appt.end);
                      const bgColor = randomBgColor(appt.id);

                      return (
                        <div
                          key={appt.id}
                          className="relative flex items-center justify-between gap-2 rounded-2xl px-2 py-1.5 text-white overflow-hidden"
                        >
                          <svg className="absolute inset-0 w-full h-full" aria-hidden="true" preserveAspectRatio="none" viewBox="0 0 1 1">
                            <rect width="1" height="1" fill={bgColor} />
                          </svg>
                          <div className="relative z-10 flex items-center justify-between gap-2 w-full min-w-0">
                            <div className="flex flex-col min-w-0 flex-1">
                              <Link
                                href={`/control-panel/appointments/${appt.id}`}
                                className="text-sm font-semibold truncate hover:underline"
                              >
                                {appt.title}
                              </Link>
                              <span className="text-[11px] text-white/80">
                                {format(start, "HH:mm")} – {format(end, "HH:mm")}
                                {appt.location && ` · ${appt.location}`}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0">
                              <Badge
                                variant="outline"
                                className="text-[10px] border-white/40 text-white px-1 py-0 capitalize"
                              >
                                {appt.status ?? "pending"}
                              </Badge>
                              <VideoCall
                                appointmentId={appt.id}
                                appointmentTitle={appt.title ?? "Video Consultation"}
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {dayAppointments.length === 0 && (
        <p className="text-center text-muted-foreground text-sm mt-6">
          No appointments on this day.
        </p>
      )}
    </div>
  );
}
