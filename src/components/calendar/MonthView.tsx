"use client";

import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  isSameMonth,
  isSameDay,
} from "date-fns";
import clsx from "clsx";
import {
  Appointment,
  Category,
  Patient,
} from "@/types/types";
import { AppointmentCard } from "@/components/shared/AppointmentCard";
import type { FullAppointment } from "@/hooks/useAppointments";
import { useMemo, useState, useCallback } from "react";
import { useDateContext } from "@/context/DateContext";
import { useAppointmentData } from "@/context/AppointmentDataContext";
import {
  useCalendarFilters,
  applyCalendarFilters,
} from "@/context/CalendarFiltersContext";
import AppointmentDialogController from "./AppointmentDialogController";
import {
  calendarGridMonthShell,
  calendarGridMonthGrid,
  calendarGridMonthSidePanel,
  calendarGridMonthWeekdayHeader,
  calendarGridMonthWeekdaysStrip,
} from "./calendarGridTokens";
import { useAuth } from "@/hooks/useAuth";
import { useAssignees } from "@/hooks/useAssignees";
import { useOwnerUserSummaries } from "@/hooks/useOwnerUserSummaries";
import { collectAppointmentStaffUserIds } from "@/lib/appointment-card";
import { useCategories } from "@/hooks/useCategories";
import { usePatients } from "@/hooks/usePatients";
import AppointmentHoverCard from "./AppointmentHoverCard";
import { X } from "lucide-react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import GlobalCalendarFilters from "./GlobalCalendarFilters";
import CalendarStickyHeader from "./CalendarStickyHeader";
import { ConfirmActionDialog } from "@/components/shared/ConfirmActionDialog";
import { formatCalendarListDayHeadline } from "@/lib/calendar-date-display";
import { useAppointmentInvoiceDisplayMap } from "@/hooks/useAppointmentInvoiceDisplayMap";
import { summarizeDayAppointments } from "@/lib/appointment-stats";
import { AppointmentOpenAlertDoneBadges } from "@/components/shared/appointments/AppointmentOpenAlertDoneBadges";

type AppointmentWithCategory = Appointment & {
  category_data?: Category;
  patient_data?: Patient;
};

export default function MonthView() {
  const {
    summaryStats,
    appointments: globalAppointments,
    toggleStatus: commitToggleStatus,
    deleteAppointmentAsync,
    isDeleting,
    isError: appointmentsError,
  } = useAppointmentData();
  const { user } = useAuth();
  const userId = user?.id ?? null;
  const userEmail = user?.email ?? null;
  const { categories } = useCategories();
  const { patients: filterPatients = [] } = usePatients();
  const { assignees } = useAssignees();
  const ownerUsers = useOwnerUserSummaries(
    collectAppointmentStaffUserIds(globalAppointments),
    user
  );
  const { category, patient, date, status, month, search, clinicalRole } =
    useCalendarFilters();
  const { currentDate } = useDateContext();
  const [editAppt, setEditAppt] = useState<AppointmentWithCategory | null>(null);

  const handleEdit = useCallback((appt: AppointmentWithCategory) => {
    setEditAppt(appt);
  }, []);

  const handleEditDialogChange = useCallback((open: boolean) => {
    if (!open) setEditAppt(null);
  }, []);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  const filteredGlobalAppointments = useMemo(
    () =>
      applyCalendarFilters(
        globalAppointments,
        { category, patient, date, status, month, search, clinicalRole },
        filterPatients,
        user?.id
      ),
    [
      globalAppointments,
      category,
      patient,
      date,
      status,
      month,
      search,
      clinicalRole,
      filterPatients,
      user?.id,
    ]
  );

  const calendarDays = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentDate), { weekStartsOn: 1 });
    const end = endOfWeek(endOfMonth(currentDate), { weekStartsOn: 1 });
    const list = filteredGlobalAppointments as AppointmentWithCategory[];
    const days: { date: Date; appointments: AppointmentWithCategory[] }[] = [];
    for (let d = start; d <= end; d = addDays(d, 1)) {
      days.push({
        date: new Date(d),
        appointments: list.filter((a) => isSameDay(new Date(a.start), d)),
      });
    }
    return days;
  }, [currentDate, filteredGlobalAppointments]);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const monthAppointments = useMemo(
    () => filteredGlobalAppointments.filter((a) => isSameMonth(new Date(a.start), currentDate)),
    [filteredGlobalAppointments, currentDate]
  );
  const monthApptIds = useMemo(
    () => monthAppointments.map((a) => a.id),
    [monthAppointments]
  );
  const invoiceDisplayByAppt = useAppointmentInvoiceDisplayMap(monthApptIds);
  const todayDate = new Date();
  const isSelectedMonthCurrentMonth =
    currentDate.getFullYear() === todayDate.getFullYear() &&
    currentDate.getMonth() === todayDate.getMonth();
  const monthTodayCount = isSelectedMonthCurrentMonth
    ? monthAppointments.filter((a) => isSameDay(new Date(a.start), todayDate)).length
    : 0;
  const monthStatus = useMemo(
    () => summarizeDayAppointments(monthAppointments),
    [monthAppointments]
  );
  const monthTitle = `${format(monthStart, "MMMM yyyy")} (${format(
    monthStart,
    "dd.MM"
  )} - ${format(monthEnd, "dd.MM")})`;

  const toggleStatus = useCallback(
    (id: string, newStatus: string) => {
      if (newStatus === "pending" || newStatus === "done" || newStatus === "alert") {
        commitToggleStatus({ id, status: newStatus });
      }
    },
    [commitToggleStatus]
  );

  // Helper: sort appointments by start time ascending
  const sortByTime = (appts: AppointmentWithCategory[]) =>
    [...appts].sort(
      (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime()
    );

  // Helper: is today
  const isToday = (date: Date) => {
    const now = new Date();
    return (
      date.getFullYear() === now.getFullYear() &&
      date.getMonth() === now.getMonth() &&
      date.getDate() === now.getDate()
    );
  };

  // Helper for date tags (Today, Tomorrow, Later, Passed)
  function getDateTag(date: Date) {
    const today = new Date();
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

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col pb-2 px-2 sm:px-4 lg:px-8 md:flex-row md:items-stretch md:space-x-8">
      {appointmentsError && (
        <div className="mb-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700 flex items-center gap-2">
          <span className="shrink-0">⚠</span>
          Failed to load appointments. Please refresh.
        </div>
      )}
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <CalendarStickyHeader >
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-semibold tracking-tight text-gray-700">
              {monthTitle}
            </h2>
            <Badge variant="outline" className="calendar-glass-badge calendar-glass-badge-sky min-h-6 min-w-[90px] justify-center">Total: {summaryStats.total}</Badge>
            <Badge variant="outline" className="calendar-glass-badge calendar-glass-badge-blue min-h-6 min-w-[90px] justify-center">This Month: {monthAppointments.length}</Badge>
            <Badge variant="outline" className="calendar-glass-badge calendar-glass-badge-emerald min-h-6 min-w-[90px] justify-center">Today: {monthTodayCount}</Badge>
            <span className="px-1 text-xs font-semibold text-gray-500">Status:</span>
            <AppointmentOpenAlertDoneBadges stats={monthStatus} />
          </div>
          <GlobalCalendarFilters
            categories={categories}
            patients={filterPatients}
            className="pb-0"
          />
        </CalendarStickyHeader>
        <div className={calendarGridMonthShell}>
          <div className={calendarGridMonthWeekdaysStrip}>
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
              <div
                key={d}
                className={calendarGridMonthWeekdayHeader}
              >
                {d}
              </div>
            ))}
          </div>
          <div className={calendarGridMonthGrid}>
            {calendarDays.map(({ date, appointments }) => {
              const selected = selectedDate && isSameDay(date, selectedDate);
              const isCurrent = isToday(date);
              const hasAppointments = appointments.length > 0;
              return (
                <div
                  key={date.toISOString()}
                  className={clsx(
                    "relative min-h-[100px] p-2 transition",
                    !isSameMonth(date, currentDate) && "bg-gray-50 text-gray-400",
                    selected && "z-10 bg-gray-200 ring-2 ring-green-600",
                    !selected && isCurrent && "bg-green-100",
                    !selected && !isCurrent && isSameMonth(date, currentDate) && "bg-white",
                    hasAppointments ? "cursor-pointer" : "cursor-default"
                  )}
                  onClick={() => hasAppointments && setSelectedDate(date)}
                >
                  <div className="flex items-center">
                    <span
                      className={clsx(
                        "flex h-6 w-6 items-center justify-center rounded text-xs font-semibold",
                        !isSameMonth(date, currentDate) &&
                        !selected &&
                        !isCurrent &&
                        "text-gray-400",
                        isSameMonth(date, currentDate) &&
                        !selected &&
                        !isCurrent &&
                        "text-gray-700",
                        selected && "bg-green-500 text-white",
                        !selected && isCurrent && "bg-transparent font-bold text-green-900"
                      )}
                    >
                      {format(date, "d")}
                    </span>
                  </div>
                  <div className="space-y-1">
                    {appointments.map((a) => {
                      // Filter assignees for this specific appointment
                      const appointmentAssignees = assignees.filter((ass) => ass.appointment === a.id);

                      return (
                        <AppointmentHoverCard
                          key={a.id}
                          appointment={a}
                          patients={filterPatients}
                          assignees={appointmentAssignees}
                          userEmail={userEmail}
                          userId={userId}
                          ownerUsers={ownerUsers}
                          detailWrap
                          invoiceDisplayStatus={invoiceDisplayByAppt.get(a.id)}
                          onEdit={handleEdit}
                          onDelete={(id) => setDeleteTargetId(id)}
                          onToggleStatus={toggleStatus}
                          showDetails={false} // Default to false, can be overridden
                        />
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <ConfirmActionDialog
        open={Boolean(deleteTargetId)}
        onOpenChange={(open) => {
          if (!open) setDeleteTargetId(null);
        }}
        title="Delete appointment?"
        subtitle="This will permanently remove the appointment from your monthly calendar."
        confirmLabel="Delete"
        onConfirm={async () => {
          if (!deleteTargetId) return;
          await deleteAppointmentAsync(deleteTargetId);
          setDeleteTargetId(null);
        }}
        confirmPending={isDeleting}
        confirmPendingLabel="Deleting…"
      />

      {/* Side list for selected date */}
      {selectedDate && (
        <div className={clsx(calendarGridMonthSidePanel, "md:self-start")}>
          <div className="mb-2 flex items-center justify-between gap-2">
            <span className="text-lg font-semibold text-gray-700">
              {formatCalendarListDayHeadline(selectedDate)}
            </span>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0 text-gray-500 hover:text-gray-800"
              aria-label="Close day list"
              onClick={() => setSelectedDate(null)}
            >
              <X className="h-4 w-4" aria-hidden />
            </Button>
          </div>
          <div className="space-y-2">
            {sortByTime(
              calendarDays.find((d) => isSameDay(d.date, selectedDate))
                ?.appointments || []
            ).map((a) => {
              const fullAppt = a as FullAppointment;
              return (
                <AppointmentCard
                  key={a.id}
                  variant="month-panel"
                  appointment={fullAppt}
                  patients={filterPatients}
                  assignees={assignees}
                  ownerUsers={ownerUsers}
                  onEdit={handleEdit}
                  onDelete={(id) => setDeleteTargetId(id)}
                  onToggleStatus={toggleStatus}
                  appointmentTypePriceCents={fullAppt.appointment_type_price_cents}
                  doctorConsultationFeeCents={fullAppt.doctor_consultation_fee_cents}
                  invoiceDisplayStatus={invoiceDisplayByAppt.get(a.id)}
                />
              );
            })}
            {(calendarDays.find((d) => isSameDay(d.date, selectedDate))
              ?.appointments.length || 0) === 0 && (
                <div className="text-gray-400 text-center">No appointments</div>
              )}
          </div>
        </div>
      )}

      {editAppt ? (
        <AppointmentDialogController
          appointment={editAppt}
          onSuccess={() => setEditAppt(null)}
          isOpen={Boolean(editAppt)}
          onOpenChange={handleEditDialogChange}
        />
      ) : null}
    </div>
  );
}