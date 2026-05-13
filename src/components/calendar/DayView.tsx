"use client";

/**
 * Single-day column: compact meta uses **Client** for `appointment.patient` (same meaning as hover card / list).
 */

import { useMemo, useState } from "react";
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
import { Button } from "@/components/ui/button";
import VideoCall from "./VideoCall";
import GlobalCalendarFilters from "./GlobalCalendarFilters";
import CalendarStickyHeader from "./CalendarStickyHeader";
import { useLiveNow } from "./useLiveNow";
import { getNowLineTop } from "./timeLinePosition";
import {
  calendarGridShell,
  calendarGridDayRow,
  calendarGridDayTimeGutter,
  calendarGridDaySlot,
  calendarGridHalfHourLine,
} from "./calendarGridTokens";
import type { Appointment } from "@/types/types";
import type { FullAppointment } from "@/hooks/useAppointments";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreVertical, CheckCircle, Circle } from "lucide-react";
import { FiEdit2, FiTrash2 } from "react-icons/fi";
import { ConfirmActionDialog } from "@/components/shared/ConfirmActionDialog";
import AppointmentDialogController from "./AppointmentDialogController";
import AppointmentHoverCard from "./AppointmentHoverCard";

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const SLOT_HEIGHT = 64; // px per hour
const SLOT_ROW_HEIGHT = 65; // 64px row + 1px border

export default function DayView() {
  const { currentDate } = useDateContext();
  const { appointments, isLoading, isError: appointmentsError, toggleStatus, deleteAppointment } = useAppointmentData();
  const { category, patient, date, status, month, search } = useCalendarFilters();
  const { categories = [] } = useCategories();
  const { patients = [] } = usePatients();
  const { relatives = [] } = useRelatives();
  const { getAppointmentColorToken } = useAppointmentColor();
  const [editAppt, setEditAppt] = useState<Appointment | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
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

  const now = useLiveNow();
  const timeLineTopPx = now ? Math.max(0, getNowLineTop(now, SLOT_ROW_HEIGHT) - 14) : 0;

  const handleToggleStatus = (id: string, newStatus: "pending" | "done" | "alert") => {
    toggleStatus({ id, status: newStatus });
  };

  return (
    <div className="min-h-0 px-2 pt-0 pb-4 sm:px-4 lg:px-8">
      {appointmentsError && (
        <div className="mb-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700 flex items-center gap-2">
          <span className="shrink-0">⚠</span>
          Failed to load appointments. Please refresh.
        </div>
      )}
      <CalendarStickyHeader >
        {/* Day header */}
        <div className="mb-2 flex flex-wrap items-center gap-3">
          <h2 className="text-xl font-semibold">{format(currentDate, "EEEE, MMMM d, yyyy")}</h2>
          <Badge variant="outline" className="calendar-glass-badge calendar-glass-badge-emerald min-h-6 min-w-[90px] justify-center">
            Today: {dayAppointments.length}
          </Badge>
          <span className="px-1 text-xs font-semibold text-gray-500">Status:</span>
          <Badge variant="outline" className="calendar-glass-badge calendar-glass-badge-amber min-h-6 min-w-[90px] justify-center">
            Open: {dayStats.open}
          </Badge>
          <Badge variant="outline" className="calendar-glass-badge calendar-glass-badge-rose min-h-6 min-w-[90px] justify-center">
            Alert: {dayStats.alert}
          </Badge>
          <Badge variant="outline" className="calendar-glass-badge calendar-glass-badge-emerald min-h-6 min-w-[90px] justify-center">
            Done: {dayStats.done}
          </Badge>
        </div>
        <GlobalCalendarFilters categories={categories} patients={patients} />
      </CalendarStickyHeader>

      {/* Time grid */}
      <div className={calendarGridShell}>
        {/* Current time indicator */}
        {now && (
          <div
            className="absolute left-14 right-0 z-20 pointer-events-none"
            style={{ top: timeLineTopPx }}
          >
            <div className="week-time-line">
              <span className="week-time-label">{format(now, "HH:mm")}</span>
            </div>
          </div>
        )}

        {HOURS.map((hour) => {
          const slotAppts = dayAppointments.filter(
            (a: Appointment) => new Date(a.start).getHours() === hour
          );

          return (
            <div
              key={hour}
              className={calendarGridDayRow}
            >
              {/* Hour label */}
              <div className={calendarGridDayTimeGutter}>
                {`${String(hour).padStart(2, "0")}:00`}
              </div>

              {/* Slot area */}
              <div className={calendarGridDaySlot}>
                {/* Half-hour dashed line */}
                <div className={calendarGridHalfHourLine} />

                {slotAppts.length > 0 && (
                  <div className="relative h-full p-1">
                    {slotAppts.map((appt: FullAppointment) => {
                      const start = new Date(appt.start);
                      const end = new Date(appt.end);
                      const isDone = appt.status === "done";
                      const hourStart = start.getHours() + start.getMinutes() / 60;
                      const hourEnd = end.getHours() + end.getMinutes() / 60;
                      const slotTop = (hourStart - hour) * SLOT_HEIGHT;
                      const slotHeight = Math.max(44, (hourEnd - hourStart) * SLOT_HEIGHT);
                      const matchedPatient = patients.find((p) => p.id === appt.patient);
                      const patientName =
                        matchedPatient?.firstname && matchedPatient?.lastname
                          ? `${matchedPatient.firstname} ${matchedPatient.lastname}`
                          : "--";
                      const categoryLabel =
                        categories.find((c) => c.id === appt.category)?.label ?? "--";
                      const colorToken = getAppointmentColorToken(
                        appt.id,
                        appt.category_data?.color ?? null
                      );

                      return (
                        <AppointmentHoverCard
                          key={appt.id}
                          appointment={appt}
                          patients={patients}
                          relatives={relatives}
                          assignees={appt.appointment_assignee ?? []}
                          activities={appt.activities ?? []}
                          userEmail={null}
                          userId={null}
                          ownerUsers={[]}
                          getDateTag={() => null}
                          onEdit={(a) => setEditAppt(a as Appointment)}
                          onDelete={(id) => setDeleteTargetId(id)}
                          onToggleStatus={(id, next) =>
                            handleToggleStatus(id, next as "pending" | "done" | "alert")
                          }
                          triggerContent={
                            <div
                              className="absolute left-1 right-1 z-10 flex cursor-pointer items-stretch overflow-hidden rounded-2xl border p-0 shadow-md transition hover:brightness-105 hover:shadow-lg"
                              style={{
                                top: slotTop,
                                height: slotHeight,
                                backgroundColor: colorToken.cardSurfaceColor,
                                borderColor: colorToken.cardBorderColor,
                              }}
                            >
                              <svg className="absolute left-0 top-0 bottom-0 h-full w-2 rounded-l-2xl" aria-hidden="true" preserveAspectRatio="none" viewBox="0 0 8 100">
                                <rect width="8" height="100" fill={colorToken.lineColor} />
                              </svg>
                              <div className="min-w-0 flex-1 pl-6 pr-4 py-2">
                                <div className="flex min-w-0 items-center gap-2">
                                  <Link
                                    href={`/control-panel/appointments/${appt.id}`}
                                    className="truncate text-sm font-medium text-gray-700 hover:underline"
                                  >
                                    {appt.title}
                                  </Link>
                                  <Badge
                                    variant="outline"
                                    className="calendar-glass-badge calendar-glass-badge-emerald shrink-0"
                                  >
                                    Today
                                  </Badge>
                                </div>
                                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 wrap-break-word text-xs text-gray-600">
                                  <span className="inline-flex items-center gap-1">
                                    <svg width="12" height="12" fill="none" viewBox="0 0 24 24" className="text-gray-400">
                                      <path d="M12 6V12L16 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                                    </svg>
                                    {format(start, "HH:mm")} - {format(end, "HH:mm")}
                                  </span>
                                  <span>Location: {appt.location || "--"}</span>
                                  <span>Client: {patientName}</span>
                                  <span>Category: {categoryLabel}</span>
                                </div>
                              </div>
                              <div className="flex shrink-0 items-center gap-1 border-l border-white/35 px-3">
                                {/* Video call button only shown for telehealth appointments */}
                                {appt.is_telehealth && (
                                  <VideoCall
                                    appointmentId={appt.id}
                                    appointmentTitle={appt.title ?? "Video Consultation"}
                                  />
                                )}
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-black/5">
                                      <MoreVertical className="h-4 w-4 text-gray-500" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end" className="w-48">
                                    <DropdownMenuItem
                                      onClick={() =>
                                        handleToggleStatus(appt.id, isDone ? "pending" : "done")
                                      }
                                    >
                                      {isDone ? (
                                        <>
                                          <Circle className="h-4 w-4" />
                                          <span>Mark as open</span>
                                        </>
                                      ) : (
                                        <>
                                          <CheckCircle className="h-4 w-4 text-green-600" />
                                          <span className="text-green-600">Mark as done</span>
                                        </>
                                      )}
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={() => setEditAppt(appt)}>
                                      <FiEdit2 className="h-4 w-4" />
                                      <span>Edit</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() => setDeleteTargetId(appt.id)}
                                      className="text-red-600 focus:bg-red-50 focus:text-red-600"
                                    >
                                      <FiTrash2 className="h-4 w-4" />
                                      <span>Delete</span>
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </div>
                          }
                        />
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      <div className="h-3" />
      <ConfirmActionDialog
        open={Boolean(deleteTargetId)}
        onOpenChange={(open) => {
          if (!open) setDeleteTargetId(null);
        }}
        title="Delete appointment?"
        subtitle="This will permanently remove the appointment from your calendar."
        confirmLabel="Delete"
        onConfirm={() => {
          if (deleteTargetId) {
            deleteAppointment(deleteTargetId);
          }
          setDeleteTargetId(null);
        }}
      />
      {editAppt ? (
        <AppointmentDialogController
          appointment={editAppt ?? undefined}
          onSuccess={() => setEditAppt(null)}
          isOpen={Boolean(editAppt)}
          onOpenChange={(open) => {
            if (!open) setEditAppt(null);
          }}
        />
      ) : null}
    </div>
  );
}
