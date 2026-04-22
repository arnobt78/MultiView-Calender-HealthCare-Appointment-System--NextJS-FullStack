"use client";

import { useMemo, useRef, useEffect } from "react";
import { format, isSameDay } from "date-fns";
import Link from "next/link";
import { useAppointments } from "@/hooks/useAppointments";
import { useDateContext } from "@/context/DateContext";
import { useAppointmentColor } from "@/context/AppointmentColorContext";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import VideoCall from "./VideoCall";
import type { Appointment } from "@/types/types";

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const SLOT_HEIGHT = 64; // px per hour

export default function DayView() {
  const { currentDate } = useDateContext();
  const { appointments, isLoading } = useAppointments();
  const { randomBgColor } = useAppointmentColor();

  const dayAppointments = useMemo(() => {
    if (!appointments) return [];
    return appointments.filter((a: Appointment) => isSameDay(new Date(a.start), currentDate));
  }, [appointments, currentDate]);

  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const isToday = isSameDay(now, currentDate);
  const timeIndicatorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (timeIndicatorRef.current) {
      timeIndicatorRef.current.style.top = `${(currentMinutes / 60) * SLOT_HEIGHT}px`;
    }
  }, [currentMinutes]);

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
    <div className="px-2 sm:px-4 lg:px-8 py-4 select-none">
      {/* Day header */}
      <div className="mb-4 flex items-center gap-3">
        <h2 className="text-xl font-semibold">{format(currentDate, "EEEE, MMMM d, yyyy")}</h2>
        {dayAppointments.length > 0 && (
          <Badge variant="secondary">
            {dayAppointments.length} appointment{dayAppointments.length !== 1 ? "s" : ""}
          </Badge>
        )}
      </div>

      {/* Time grid */}
      <div className="relative border rounded-md overflow-hidden bg-background">
        {/* Current time indicator */}
        {isToday && (
          <div
            ref={timeIndicatorRef}
            className="absolute left-0 right-0 z-20 flex items-center pointer-events-none"
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
                          className="relative flex items-center justify-between gap-2 rounded-md px-2 py-1.5 text-white overflow-hidden"
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
