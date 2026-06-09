"use client";

/**
 * Single-day column: compact meta uses **Client** for `appointment.patient` (same meaning as hover card / list).
 */

import { useMemo, useState } from "react";
import { format, isSameDay } from "date-fns";
import { useAssignees } from "@/hooks/useAssignees";
import { useOwnerUserSummaries } from "@/hooks/useOwnerUserSummaries";
import { useAuth } from "@/hooks/useAuth";
import { collectAppointmentStaffUserIds } from "@/lib/appointment-card";
import { useAppointmentData } from "@/context/AppointmentDataContext";
import {
  useCalendarFilters,
  applyCalendarFilters,
} from "@/context/CalendarFiltersContext";
import { useDateContext } from "@/context/DateContext";
import { useCategories } from "@/hooks/useCategories";
import { usePatients } from "@/hooks/usePatients";
import { Badge } from "@/components/ui/badge";
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
import { ConfirmActionDialog } from "@/components/shared/ConfirmActionDialog";
import AppointmentDialogController from "./AppointmentDialogController";
import AppointmentHoverCard from "./AppointmentHoverCard";
import { useAppointmentInvoiceDisplayMap } from "@/hooks/useAppointmentInvoiceDisplayMap";
import { resolveDayStatsForDate } from "@/lib/appointment-stats";
import { AppointmentOpenAlertDoneBadges } from "@/components/shared/appointments/AppointmentOpenAlertDoneBadges";

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const SLOT_HEIGHT = 64; // px per hour
const SLOT_ROW_HEIGHT = 65; // 64px row + 1px border

export default function DayView() {
  const { currentDate } = useDateContext();
  const {
    appointments,
    dailyStatsMap,
    isLoading,
    isError: appointmentsError,
    toggleStatus,
    deleteAppointment,
    cancelAppointment,
  } = useAppointmentData();
  const { user } = useAuth();
  const { category, patient, date, status, month, search, clinicalRole, hasActiveFilters } =
    useCalendarFilters();
  const { categories = [] } = useCategories();
  const { patients = [] } = usePatients();
  const { assignees } = useAssignees();
  const ownerUsers = useOwnerUserSummaries(
    collectAppointmentStaffUserIds(appointments),
    user
  );
  const [editAppt, setEditAppt] = useState<Appointment | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const filteredAppointments = useMemo(
    () =>
      applyCalendarFilters(
        appointments,
        { category, patient, date, status, month, search, clinicalRole },
        patients,
        user?.id
      ),
    [
      appointments,
      category,
      patient,
      date,
      status,
      month,
      search,
      clinicalRole,
      patients,
      user?.id,
    ]
  );

  const dayAppointments = useMemo(() => {
    if (!filteredAppointments) return [];
    return filteredAppointments.filter((a: Appointment) => isSameDay(new Date(a.start), currentDate));
  }, [filteredAppointments, currentDate]);

  /** Invoice badge on hover popover — from warm `invoices.all` cache (list/month parity). */
  const invoiceDisplayByAppt = useAppointmentInvoiceDisplayMap(
    dayAppointments.map((a) => a.id)
  );

  const dayStats = useMemo(
    () =>
      resolveDayStatsForDate({
        date: currentDate,
        filteredDayAppts: dayAppointments,
        dailyStatsMap,
        preferCached: !hasActiveFilters,
      }),
    [currentDate, dayAppointments, dailyStatsMap, hasActiveFilters]
  );

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
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <h2 className="text-lg font-semibold">{format(currentDate, "EEEE, MMMM d, yyyy")}</h2>
          <Badge variant="outline" className="calendar-glass-badge calendar-glass-badge-emerald min-h-6 min-w-[90px] justify-center">
            Today: {dayAppointments.length}
          </Badge>
          <span className="px-1 text-xs font-semibold text-gray-500">Status:</span>
          <AppointmentOpenAlertDoneBadges stats={dayStats} />
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
                      const hourStart = start.getHours() + start.getMinutes() / 60;
                      const hourEnd = end.getHours() + end.getMinutes() / 60;
                      const slotTop = (hourStart - hour) * SLOT_HEIGHT;
                      const slotHeight = Math.max(44, (hourEnd - hourStart) * SLOT_HEIGHT);

                      return (
                        <div
                          key={appt.id}
                          className="absolute left-1 right-1 z-10"
                          style={{ top: slotTop, height: slotHeight }}
                        >
                          <AppointmentHoverCard
                            appointment={appt}
                            patients={patients}
                            assignees={assignees}
                            userEmail={user?.email ?? null}
                            userId={user?.id ?? null}
                            ownerUsers={ownerUsers}
                            slotHeightPx={slotHeight}
                            onEdit={(a) => setEditAppt(a as Appointment)}
                            onDelete={(id) => setDeleteTargetId(id)}
                            onCancel={cancelAppointment}
                            onToggleStatus={(id, next) =>
                              handleToggleStatus(id, next as "pending" | "done" | "alert")
                            }
                            invoiceDisplayStatus={invoiceDisplayByAppt.get(appt.id)}
                            showDetails
                          />
                        </div>
                      )
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
