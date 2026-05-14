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
  AppointmentAssignee,
} from "@/types/types";
// Using Vercel Blob for file storage
import { getPublicUrl } from "@/lib/vercelBlob";
import { useMemo, useState, useCallback } from "react";
import { useDateContext } from "@/context/DateContext";
import { useAppointmentData } from "@/context/AppointmentDataContext";
import {
  useCalendarFilters,
  applyCalendarFilters,
} from "@/context/CalendarFiltersContext";
import { invalidateAppointmentData } from "@/lib/query-client";
import AppointmentDialogController from "./AppointmentDialogController";
import {
  calendarGridMonthShell,
  calendarGridMonthGrid,
  calendarGridMonthSidePanel,
  calendarGridMonthWeekdayHeader,
  calendarGridMonthWeekdaysStrip,
} from "./calendarGridTokens";
import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useAssignees } from "@/hooks/useAssignees";
import { useOwnerUserSummaries } from "@/hooks/useOwnerUserSummaries";
import { useCategories } from "@/hooks/useCategories";
import { usePatients } from "@/hooks/usePatients";
import {
  FiEdit2,
  FiTrash2,
  FiFileText,
  FiUser,
  FiMapPin,
  FiPaperclip,
  FiFlag,
  FiUsers,
} from "react-icons/fi";
import AppointmentHoverCard from "./AppointmentHoverCard";
import { useAppointmentColor } from "@/context/AppointmentColorContext";
import { Badge } from "../ui/badge";
import GlobalCalendarFilters from "./GlobalCalendarFilters";
import CalendarStickyHeader from "./CalendarStickyHeader";
import { ConfirmActionDialog } from "@/components/shared/ConfirmActionDialog";

type AppointmentWithCategory = Appointment & {
  category_data?: Category;
  patient_data?: Patient;
};

export default function MonthView() {
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
  const ownerUsers = useOwnerUserSummaries(globalAppointments.map((a) => a.user_id), user);
  const { category, patient, date, status, month, search } = useCalendarFilters();
  const queryClient = useQueryClient();
  const { currentDate } = useDateContext();
  const [editAppt, setEditAppt] = useState<AppointmentWithCategory | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  const { getAppointmentColorToken } = useAppointmentColor();

  const filteredGlobalAppointments = useMemo(
    () =>
      applyCalendarFilters(
        globalAppointments,
        { category, patient, date, status, month, search },
        filterPatients
      ),
    [
      globalAppointments,
      category,
      patient,
      date,
      status,
      month,
      search,
      filterPatients,
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
  const todayDate = new Date();
  const isSelectedMonthCurrentMonth =
    currentDate.getFullYear() === todayDate.getFullYear() &&
    currentDate.getMonth() === todayDate.getMonth();
  const monthTodayCount = isSelectedMonthCurrentMonth
    ? monthAppointments.filter((a) => isSameDay(new Date(a.start), todayDate)).length
    : 0;
  const monthStatus = useMemo(
    () =>
      monthAppointments.reduce(
        (acc, appt) => {
          if (appt.status === "done") acc.done += 1;
          else if (appt.status === "alert") acc.alert += 1;
          else acc.open += 1;
          return acc;
        },
        { open: 0, alert: 0, done: 0 }
      ),
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

  const deleteAppt = useCallback(
    (id: string) => {
      deleteAppointment(id);
    },
    [deleteAppointment]
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
    <div className="flex h-full min-h-0 flex-1 flex-col pb-3 px-2 sm:px-4 lg:px-8 md:flex-row md:items-stretch md:space-x-8">
      {appointmentsError && (
        <div className="mb-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700 flex items-center gap-2">
          <span className="shrink-0">⚠</span>
          Failed to load appointments. Please refresh.
        </div>
      )}
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <CalendarStickyHeader >
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <h2 className="text-xl font-semibold tracking-tight text-gray-700">
              {monthTitle}
            </h2>
            <Badge variant="outline" className="calendar-glass-badge calendar-glass-badge-sky min-h-6 min-w-[90px] justify-center">Total: {summaryStats.total}</Badge>
            <Badge variant="outline" className="calendar-glass-badge calendar-glass-badge-blue min-h-6 min-w-[90px] justify-center">This Month: {monthAppointments.length}</Badge>
            <Badge variant="outline" className="calendar-glass-badge calendar-glass-badge-emerald min-h-6 min-w-[90px] justify-center">Today: {monthTodayCount}</Badge>
            <span className="px-1 text-xs font-semibold text-gray-500">Status:</span>
            <Badge variant="outline" className="calendar-glass-badge calendar-glass-badge-amber min-h-6 min-w-[90px] justify-center">Open: {monthStatus.open}</Badge>
            <Badge variant="outline" className="calendar-glass-badge calendar-glass-badge-rose min-h-6 min-w-[90px] justify-center">Alert: {monthStatus.alert}</Badge>
            <Badge variant="outline" className="calendar-glass-badge calendar-glass-badge-emerald min-h-6 min-w-[90px] justify-center">Done: {monthStatus.done}</Badge>
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
                  <div className="mb-1 flex items-center">
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
                          getDateTag={getDateTag}
                          onEdit={setEditAppt}
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
          if (deleteTargetId) await deleteAppt(deleteTargetId);
          setDeleteTargetId(null);
        }}
      />

      {/* Side list for selected date */}
      {selectedDate && (
        <div className={clsx(calendarGridMonthSidePanel, "md:self-start")}>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg font-semibold text-gray-700">
              {new Intl.DateTimeFormat("de-DE", {
                weekday: "long",
                day: "numeric",
                month: "long",
              }).format(selectedDate)}
            </span>
          </div>
          <div className="space-y-2">
            {sortByTime(
              calendarDays.find((d) => isSameDay(d.date, selectedDate))
                ?.appointments || []
            ).map((a) => {
              const colorToken = getAppointmentColorToken(
                a.id,
                a.category_data?.color ?? null
              );
              const isDone = a.status === "done";

              // Deduplicate assignees by user + invited_email
              const filteredAssignees = assignees.filter((ass) => ass.appointment === a.id);
              const dedupedMap = new Map();
              for (const ass of filteredAssignees) {
                const key = `${ass.user || ''}|${ass.invited_email || ''}`;
                if (!dedupedMap.has(key)) {
                  dedupedMap.set(key, ass);
                } else {
                  // Prefer accepted over pending, prefer higher permission
                  const prev = dedupedMap.get(key) as AppointmentAssignee;
                  const statusOrder: Record<'accepted' | 'pending', number> = { accepted: 2, pending: 1 };
                  const permOrder: Record<'full' | 'write' | 'read', number> = { full: 3, write: 2, read: 1 };
                  // Type guards for status and permission
                  const isValidStatus = (s: unknown): s is 'accepted' | 'pending' => s === 'accepted' || s === 'pending';
                  const isValidPerm = (p: unknown): p is 'full' | 'write' | 'read' => p === 'full' || p === 'write' || p === 'read';
                  const prevStatus = isValidStatus(prev.status) ? statusOrder[prev.status] : 0;
                  const currStatus = isValidStatus(ass.status) ? statusOrder[ass.status] : 0;
                  const prevPerm = isValidPerm(prev.permission) ? permOrder[prev.permission] : 0;
                  const currPerm = isValidPerm(ass.permission) ? permOrder[ass.permission] : 0;
                  if (
                    currStatus > prevStatus ||
                    (currStatus === prevStatus && currPerm > prevPerm)
                  ) {
                    dedupedMap.set(key, ass);
                  }
                }
              }
              const dedupedAssignees = Array.from(dedupedMap.values());

              return (
                <div
                  key={a.id}
                  className={clsx(
                    "relative border rounded-2xl shadow p-0 flex items-stretch transition hover:shadow-xl min-h-[110px]",
                    isDone && "bg-gray-100 opacity-60"
                  )}
                  style={{
                    backgroundColor: colorToken.cardBgColor,
                    borderColor: colorToken.cardBorderColor,
                  }}
                >
                  {/* Color bar */}
                  <svg className="absolute left-0 top-0 bottom-0 w-2 h-full rounded-l-xl" aria-hidden="true" preserveAspectRatio="none" viewBox="0 0 8 100">
                    <rect width="8" height="100" fill={colorToken.lineColor} />
                  </svg>
                  {/* Main content */}
                  <div className="pl-6 pr-2 py-4 flex-1 flex flex-col justify-center min-h-[110px]">
                    <div className="flex items-center gap-2">
                      <span className="text-md font-medium text-gray-700 flex items-center mb-1">
                        {a.title}
                        {getDateTag(new Date(a.start))}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500 mb-1">
                      <span className="flex items-center gap-1">
                        <FiFileText />
                        {format(new Date(a.start), "dd.MM.yyyy")}
                      </span>
                      <span className="flex items-center gap-1">
                        <FiFlag />
                        {format(new Date(a.start), "HH:mm")} –{" "}
                        {format(new Date(a.end), "HH:mm")}
                      </span>
                    </div>

                    {a.notes && (
                      <div className="flex items-center gap-2 text-sm text-gray-400 mb-1">
                        <span className="shrink-0 flex items-center justify-center">
                          <FiFileText className="w-4 h-4 " />
                        </span>
                        <span className="text-xs text-gray-700 wrap-break-word">
                          Notes: {a.notes}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center gap-2 text-xs text-gray-400 italic mb-1">
                      <FiUser /> Client:{" "}
                      <span className="not-italic text-gray-700">
                        {a.patient && filterPatients.length > 0
                          ? (() => {
                            const p = filterPatients.find(
                              (x) => x.id === a.patient
                            );
                            return p ? `${p.firstname} ${p.lastname}` : "--";
                          })()
                          : "--"}
                      </span>
                    </div>

                    {a.location && (
                      <div className="flex items-center gap-2 text-xs text-gray-400 italic mb-1">
                        <FiMapPin /> Location:{" "}
                        <span className="not-italic text-gray-700">
                          {a.location}
                        </span>
                      </div>
                    )}

                    {a.attachments && a.attachments.length > 0 && (
                      <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
                        <FiPaperclip /> Attachments:
                        {a.attachments.map((file, idx) => {
                          // Get Vercel Blob public URL
                          const publicUrl = getPublicUrl(file);
                          const fileName = file.split("/").pop() || file;
                          return publicUrl ? (
                            <a
                              key={idx}
                              href={publicUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="not-italic text-blue-700 underline"
                            >
                              {fileName}
                            </a>
                          ) : (
                            <span key={idx} className="text-red-600">
                              [Error: File not found]
                            </span>
                          );
                        })}
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
                      <FiFlag /> Status:
                      <span className="not-italic text-gray-700">
                        {a.status}
                      </span>
                    </div>

                    {/* Client row — `appointment.patient` is FK / embedded patient name (not calendar owner). */}
                    {a.patient && (
                      <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
                        <FiUser /> Client:
                        {(() => {
                          try {
                            // If patient is already an object with firstname/lastname
                            if (a.patient &&
                              typeof a.patient === 'object' &&
                              'firstname' in a.patient &&
                              'lastname' in a.patient) {
                              const patientObj = a.patient as Patient;
                              return (
                                <span className="not-italic text-purple-700">
                                  Patient: {patientObj.firstname} {patientObj.lastname}
                                </span>
                              );
                            }

                            // If patient is a string ID and patients are loaded
                            if (typeof a.patient === 'string' && filterPatients.length > 0) {
                              const patient = filterPatients.find((p) => p.id === a.patient);
                              if (patient && patient.firstname && patient.lastname) {
                                return (
                                  <span className="not-italic text-purple-700">
                                    Patient: {patient.firstname} {patient.lastname}
                                  </span>
                                );
                              }
                            }

                            // Fallback
                            return (
                              <span className="not-italic text-red-700">
                                Patient data not available
                              </span>
                            );
                          } catch (error: unknown) {
                            console.error('Error in MonthView patient lookup:', error);
                            return (
                              <span className="not-italic text-red-700">
                                Error loading patient
                              </span>
                            );
                          }
                        })()}
                      </div>
                    )}

                    {dedupedAssignees.length > 0 && (
                      <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
                        <FiUser /> Assigned by:
                        {a.user_id === userId ? (
                          // Owner view
                          <span className="not-italic text-green-700">
                            you ({userEmail || "owner"})
                          </span>
                        ) : (
                          // Invitee view: show owner's email
                          <span className="not-italic text-blue-700">
                            {(() => {
                              const owner = ownerUsers.find(u => u.id === a.user_id);
                              return owner?.email || a.user_id;
                            })()}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Actions column */}
                  <div className="flex flex-col items-center gap-3 min-w-[56px] py-4 px-2 justify-center">
                    {/* Status checkbox - only show if user is owner, full, or write permission */}
                    {(() => {
                      // Check if user is the owner
                      const isOwner = a.user_id === userId;

                      // Get user permission from assignees if not owner
                      let userPermission: "full" | "write" | "read" | null = null;

                      if (!isOwner && dedupedAssignees && dedupedAssignees.length > 0) {
                        // Find the current user's assignment
                        const userAssignment = dedupedAssignees.find(
                          (ass) =>
                            (ass.user === userId || (!!userEmail && ass.invited_email === userEmail)) &&
                            ass.appointment === a.id &&
                            ass.status === "accepted"
                        );
                        userPermission = userAssignment?.permission || null;

                      }

                      // Only owner, full, or write can toggle status
                      if (isOwner || userPermission === "full" || userPermission === "write") {
                        return (
                          <label className="flex flex-col items-center gap-1">
                            <input
                              type="checkbox"
                              className="mb-1 accent-green-600 w-5 h-5 cursor-pointer"
                              checked={isDone}
                              onChange={() =>
                                toggleStatus(a.id, isDone ? "pending" : "done")
                              }
                            />
                            <span className="text-xs text-gray-500 select-none">
                              {isDone ? "Done" : "Open"}
                            </span>
                          </label>
                        );
                      }
                      return null;
                    })()}

                    {/* Edit button - only show if user is owner or has full permission */}
                    {(() => {
                      // Check if user is the owner
                      const isOwner = a.user_id === userId;

                      // Get user permission from assignees if not owner
                      let userPermission: "full" | "write" | "read" | null = null;

                      if (!isOwner && dedupedAssignees && dedupedAssignees.length > 0) {
                        // Find the current user's assignment
                        const userAssignment = dedupedAssignees.find(
                          (ass) =>
                            (ass.user === userId || (!!userEmail && ass.invited_email === userEmail)) &&
                            ass.appointment === a.id &&
                            ass.status === "accepted"
                        );
                        userPermission = userAssignment?.permission || null;

                      }

                      // Only owner or full can edit
                      if (isOwner || userPermission === "full") {
                        return (
                          <Button
                            size="icon"
                            variant="outline"
                            className="rounded-full border-gray-300 cursor-pointer"
                            onClick={() => setEditAppt(a)}
                            aria-label="Edit"
                          >
                            <FiEdit2 className="w-4 h-4" />
                          </Button>
                        );
                      }
                      return null;
                    })()}

                    {/* Delete button - only show if user is owner or has full permission */}
                    {(() => {
                      // Check if user is the owner
                      const isOwner = a.user_id === userId;

                      // Get user permission from assignees if not owner
                      let userPermission: "full" | "write" | "read" | null = null;

                      if (!isOwner && dedupedAssignees && dedupedAssignees.length > 0) {
                        // Find the current user's assignment
                        const userAssignment = dedupedAssignees.find(
                          (ass) =>
                            (ass.user === userId || (!!userEmail && ass.invited_email === userEmail)) &&
                            ass.appointment === a.id &&
                            ass.status === "accepted"
                        );
                        userPermission = userAssignment?.permission || null;
                      }

                      // Only owner or full can delete
                      if (isOwner || userPermission === "full") {
                        return (
                          <Button
                            size="icon"
                            variant="ghost"
                            className="rounded-full cursor-pointer"
                            onClick={() => deleteAppt(a.id)}
                            aria-label="Delete"
                          >
                            <FiTrash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        );
                      }
                      return null;
                    })()}
                  </div>
                </div>
              );
            })}
            {(calendarDays.find((d) => isSameDay(d.date, selectedDate))
              ?.appointments.length || 0) === 0 && (
                <div className="text-gray-400 text-center">No appointments</div>
              )}
          </div>
        </div>
      )}

      {/* Edit dialog */}
      {editAppt && (
        <AppointmentDialogController
          appointment={editAppt}
          onSuccess={() => {
            setEditAppt(null);
            void invalidateAppointmentData(queryClient);
          }}
        />
      )}
    </div>
  );
}