"use client";

import { useState, useMemo, useCallback, type CSSProperties } from "react";
import { format, startOfWeek, endOfWeek, isSameDay, addDays, setHours, setMinutes } from "date-fns";
import { Appointment, Category, AppointmentAssignee } from "@/types/types";
import AppointmentDialogController from "./AppointmentDialogController";
import { useDateContext } from "@/context/DateContext";
import { useAppointmentData } from "@/context/AppointmentDataContext";
import {
  useCalendarFilters,
  applyCalendarFilters,
} from "@/context/CalendarFiltersContext";
import { useCategories } from "@/hooks/useCategories";
import { usePatients } from "@/hooks/usePatients";
import { useAuth } from "@/hooks/useAuth";
import { useAssignees } from "@/hooks/useAssignees";
import { useOwnerUserSummaries } from "@/hooks/useOwnerUserSummaries";
import { cn } from "@/lib/utils";
import { collectAppointmentStaffUserIds } from "@/lib/appointment-card";
import AppointmentHoverCard from "./AppointmentHoverCard";
import { Badge } from "../ui/badge";
import GlobalCalendarFilters from "./GlobalCalendarFilters";
import CalendarStickyHeader from "./CalendarStickyHeader";
import { useLiveNow } from "./useLiveNow";
import { getNowLineTop } from "./timeLinePosition";
import { ConfirmActionDialog } from "@/components/shared/ConfirmActionDialog";
import {
  calendarGridWeekOuterShell,
  calendarGridWeekStickyCorner,
  calendarGridWeekHeaderCell,
  calendarGridWeekHourCell,
  calendarGridWeekSlotCell,
  calendarGridHalfHourLine,
} from "./calendarGridTokens";

type AppointmentWithCategory = Appointment & {
  category_data?: Category;
  appointment_assignee?: AppointmentAssignee[];
};

export default function WeekView() {
  const { currentDate } = useDateContext();
  const {
    summaryStats,
    appointments: globalAppointments,
    toggleStatus: commitToggleStatus,
    deleteAppointment,
    isError: appointmentsError,
  } = useAppointmentData();
  const { user } = useAuth();
  const userId = user?.id ?? null;
  const userEmail = user?.email ?? null;
  const { categories = [] } = useCategories();
  const { patients: filterPatients = [] } = usePatients();
  const { assignees } = useAssignees();
  const ownerUsers = useOwnerUserSummaries(
    collectAppointmentStaffUserIds(globalAppointments),
    user
  );
  const { category, patient, date, status, month, search } = useCalendarFilters();
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const [editAppt, setEditAppt] = useState<AppointmentWithCategory | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  const filteredGlobalAppointments = useMemo(
    () =>
      applyCalendarFilters(
        globalAppointments,
        { category, patient, date, status, month, search },
        filterPatients
      ),
    [globalAppointments, category, patient, date, status, month, search, filterPatients]
  );
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
  const weekAppointments = useMemo(
    () =>
      filteredGlobalAppointments.filter((appt) => {
        const apptStart = new Date(appt.start).getTime();
        const start = weekStart.getTime();
        const end = weekEnd.getTime();
        return apptStart >= start && apptStart <= end;
      }),
    [filteredGlobalAppointments, weekStart, weekEnd]
  );
  const today = new Date();
  const selectedWeekHasToday = (() => {
    const t = today.getTime();
    const start = weekStart.getTime();
    const end = weekEnd.getTime();
    return t >= start && t <= end;
  })();
  const weekTodayCount = selectedWeekHasToday
    ? weekAppointments.filter((appt) => isSameDay(new Date(appt.start), today)).length
    : 0;
  const weekStatus = useMemo(
    () =>
      weekAppointments.reduce(
        (acc, appt) => {
          if (appt.status === "done") acc.done += 1;
          else if (appt.status === "alert") acc.alert += 1;
          else acc.open += 1;
          return acc;
        },
        { open: 0, alert: 0, done: 0 }
      ),
    [weekAppointments]
  );
  const weekTitle = `${format(weekStart, "EEE dd.MM.yyyy")} - ${format(
    weekEnd,
    "EEE dd.MM.yyyy"
  )}`;

  const toggleStatus = useCallback(
    (id: string, newStatus: string) => {
      if (newStatus === "pending" || newStatus === "done" || newStatus === "alert") {
        commitToggleStatus({ id, status: newStatus });
      }
    },
    [commitToggleStatus]
  );

  const deleteAppt = useCallback(
    (id: string) => {
      deleteAppointment(id);
    },
    [deleteAppointment]
  );

  // Helper for lighter color
  function lightenColor(hex: string, percent: number) {
    // Simple lighten for hex colors
    const num = parseInt(hex.replace("#", ""), 16);
    const r = (num >> 16) + Math.round(2.55 * percent);
    const g = ((num >> 8) & 0x00ff) + Math.round(2.55 * percent);
    const b = (num & 0x0000ff) + Math.round(2.55 * percent);
    return (
      "#" +
      (
        0x1000000 +
        (r < 255 ? (r < 1 ? 0 : r) : 255) * 0x10000 +
        (g < 255 ? (g < 1 ? 0 : g) : 255) * 0x100 +
        (b < 255 ? (b < 1 ? 0 : b) : 255)
      )
        .toString(16)
        .slice(1)
    );
  }

  // Tag logic (Today, Next, One day later, Date overdrawn)
  function getDateTag(date: Date) {
    const today = new Date(currentDate);
    today.setHours(0, 0, 0, 0);
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    const diffDays = Math.floor(
      (d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (diffDays === 0)
      return (
        <Badge variant="outline" className="calendar-glass-badge calendar-glass-badge-emerald ">
          Today
        </Badge>
      );
    if (diffDays === 1)
      return (
        <Badge variant="outline" className="calendar-glass-badge calendar-glass-badge-blue ">
          Tomorrow
        </Badge>
      );
    if (diffDays > 1)
      return (
        <Badge variant="outline" className="calendar-glass-badge calendar-glass-badge-violet ">
          Later
        </Badge>
      );
    if (diffDays < 0)
      return (
        <Badge variant="outline" className="calendar-glass-badge calendar-glass-badge-slate ">
          Passed
        </Badge>
      );
    return null;
  }

  // --- UI update: Only one outer scrollbar, calendar stretches naturally ---
  // Set hourHeight and dayWidth for grid and card calculations
  const hourHeight = 64; // px per hour
  const dayWidth = 240; // px per day column, increased for better fit
  const headerRowHeight = 40; // px, must match week header row fixed height

  // --- Real-time red current time line feature ---
  // State for current time (updates every minute)
  const now = useLiveNow();

  // Helper: get position of red line (in px from top)
  const getRedLinePosition = () => (now ? getNowLineTop(now, hourHeight) : 0);

  const handleEditDialogChange = (open: boolean) => {
    setEditOpen(open);
    if (!open) setEditAppt(null);
  };

  const showWeekNowLine = Boolean(now);
  const weekIndicatorTopPx = showWeekNowLine
    ? headerRowHeight + getRedLinePosition() - (hourHeight / 60) * 2
    : 0;

  const apptBlockRef = useCallback((el: HTMLDivElement | null, slotTop: number, slotHeight: number) => {
    if (el) {
      el.style.top = `${slotTop}px`;
      el.style.height = `${slotHeight}px`;
    }
  }, []);

  return (
    <div className="min-h-0 pt-0 px-2 sm:px-4 lg:px-8">
      {appointmentsError && (
        <div className="mb-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700 flex items-center gap-2">
          <span className="shrink-0">⚠</span>
          Failed to load appointments. Please refresh.
        </div>
      )}
      <CalendarStickyHeader >
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <h2 className="text-xl font-semibold tracking-tight text-gray-700">
            {weekTitle}
          </h2>
          <Badge variant="outline" className="calendar-glass-badge calendar-glass-badge-sky min-h-6 min-w-[90px] justify-center">Total: {summaryStats.total}</Badge>
          <Badge variant="outline" className="calendar-glass-badge calendar-glass-badge-blue min-h-6 min-w-[90px] justify-center">This Week: {weekAppointments.length}</Badge>
          <Badge variant="outline" className="calendar-glass-badge calendar-glass-badge-emerald min-h-6 min-w-[90px] justify-center">Today: {weekTodayCount}</Badge>
          <span className="px-1 text-xs font-semibold text-gray-500">Status:</span>
          <Badge variant="outline" className="calendar-glass-badge calendar-glass-badge-amber min-h-6 min-w-[90px] justify-center">Open: {weekStatus.open}</Badge>
          <Badge variant="outline" className="calendar-glass-badge calendar-glass-badge-rose min-h-6 min-w-[90px] justify-center">Alert: {weekStatus.alert}</Badge>
          <Badge variant="outline" className="calendar-glass-badge calendar-glass-badge-emerald min-h-6 min-w-[90px] justify-center">Done: {weekStatus.done}</Badge>
        </div>
        <GlobalCalendarFilters categories={categories} patients={filterPatients} />
      </CalendarStickyHeader>
      <div className={calendarGridWeekOuterShell}>
        <div className="relative grid w-full text-sm week-grid">
          {showWeekNowLine && (
            <div
              className="week-time-indicator"
              style={
                { ["--indicator-top" as string]: `${weekIndicatorTopPx}px` } as CSSProperties
              }
            >
              <div className="week-time-line">
                <span className="week-time-label">
                  {now ? format(now, "HH:mm") : ""}
                </span>
              </div>
            </div>
          )}
          {/* Top-left sticky cell */}
          <div className={calendarGridWeekStickyCorner} />

          {/* Date/day header row */}
          {Array.from({ length: 7 }).map((_, i) => {
            const day = addDays(weekStart, i);
            // Only highlight and show 'Today' if today is in this week
            const isToday = day.toDateString() === new Date().toDateString();
            const isCurrentWeek = (() => {
              const today = new Date();
              const weekStartDate = startOfWeek(today, { weekStartsOn: 1 });
              const weekEndDate = addDays(weekStartDate, 6);
              return weekStart.getTime() === weekStartDate.setHours(0, 0, 0, 0);
            })();
            return (
              <div
                key={i}
                className={
                  calendarGridWeekHeaderCell +
                  (isToday && isCurrentWeek ? " week-day-header-today" : "")
                }
              >
                {format(day, "EEE dd.MM.")}
                {isToday && isCurrentWeek && (
                  <Badge variant="outline" className="calendar-glass-badge calendar-glass-badge-emerald ">
                    Today
                  </Badge>
                )}
              </div>
            );
          })}
          {/* Calendar grid */}
          {hours.map((hour) => (
            <div key={hour} className="contents">
              {/* Time column sticky */}
              <div
                className={calendarGridWeekHourCell}
              >{`${hour}:00`}
              </div>
              {Array.from({ length: 7 }).map((_, i) => {
                const day = addDays(weekStart, i);
                // Only highlight current day column if today is in this week
                const today = new Date();
                const weekStartDate = startOfWeek(today, { weekStartsOn: 1 });
                const isCurrentWeek = weekStart.getTime() === weekStartDate.setHours(0, 0, 0, 0);
                const isTodayCol = day.toDateString() === today.toDateString() && isCurrentWeek;
                const slotStart = setMinutes(setHours(day, hour), 0);
                const slotEnd = setMinutes(setHours(day, hour + 1), 0);
                // Find all appointments that overlap this hour slot
                const matches = filteredGlobalAppointments.filter((a) => {
                  const start = new Date(a.start);
                  const end = new Date(a.end);
                  return (
                    start < slotEnd &&
                    end > slotStart &&
                    start.toDateString() === day.toDateString()
                  );
                });
                return (
                  <div
                    key={i}
                    className={
                      calendarGridWeekSlotCell + (isTodayCol ? " week-slot-today" : "")
                    }
                  >
                    <div className={calendarGridHalfHourLine} />
                    {/* Inject your code here: */}
                    {matches.map((a) => {
                      const start = new Date(a.start);
                      const end = new Date(a.end);
                      const hourStart = start.getHours() + start.getMinutes() / 60;
                      const hourEnd = end.getHours() + end.getMinutes() / 60;
                      // Only render in the slot where the appointment starts
                      if (start.getHours() !== hour || start.toDateString() !== day.toDateString()) return null;
                      const slotTop = (hourStart - hour) * hourHeight;
                      const slotHeight = Math.max(30, (hourEnd - hourStart) * hourHeight); // 30px min height
                      return (
                        <div
                          key={a.id}
                          ref={(el) => apptBlockRef(el, slotTop, slotHeight)}
                          className="week-appt-block"
                        >
                          <AppointmentHoverCard
                            appointment={a}
                            patients={filterPatients}
                            assignees={assignees.filter((ass) => ass.appointment === a.id)}
                            userEmail={userEmail}
                            userId={userId}
                            ownerUsers={ownerUsers}
                            detailWrap
                            slotHeightPx={slotHeight}
                            onEdit={setEditAppt}
                            onDelete={(id) => setDeleteTargetId(id)}
                            onToggleStatus={toggleStatus}
                            showDetails={true}
                          />
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
      <div className="h-3" />

      <ConfirmActionDialog
        open={Boolean(deleteTargetId)}
        onOpenChange={(open) => {
          if (!open) setDeleteTargetId(null);
        }}
        title="Delete appointment?"
        subtitle="This will permanently remove the appointment from your weekly calendar."
        confirmLabel="Delete"
        onConfirm={async () => {
          if (deleteTargetId) await deleteAppt(deleteTargetId);
          setDeleteTargetId(null);
        }}
      />

      {/* Edit dialog */}
      {
        editAppt && (
          <AppointmentDialogController
            appointment={editAppt}
            onSuccess={() => setEditAppt(null)}
            isOpen={editOpen}
            onOpenChange={handleEditDialogChange}
          />
        )
      }
    </div >
  );
}
