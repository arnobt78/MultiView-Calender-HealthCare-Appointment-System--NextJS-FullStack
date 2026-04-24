"use client";

import { useEffect, useState, useMemo, useCallback, type CSSProperties } from "react";
import { format, startOfWeek, endOfWeek, isSameDay, addDays, setHours, setMinutes } from "date-fns";
import { Appointment, Category, AppointmentAssignee, Patient, Relative, Activity } from "@/types/types";
import { getUserAppointmentPermission } from "@/lib/permissions";
import AppointmentDialogController from "./AppointmentDialogController";
import { useDateContext } from "@/context/DateContext";
import { useAppointmentData } from "@/context/AppointmentDataContext";
import {
  useCalendarFilters,
  applyCalendarFilters,
} from "@/context/CalendarFiltersContext";
import { invalidateAllForCrud } from "@/lib/query-client";
import { queryKeys } from "@/lib/query-keys";
import { useQueryClient } from "@tanstack/react-query";
import { useCategories } from "@/hooks/useCategories";
import { usePatients } from "@/hooks/usePatients";
import { useRelatives } from "@/hooks/useRelatives";
import AppointmentHoverCard from "./AppointmentHoverCard";
import { useAppointmentColor } from "@/context/AppointmentColorContext";
import { Badge } from "../ui/badge";
import type { FullAppointment } from "@/hooks/useAppointments";
import GlobalCalendarFilters from "./GlobalCalendarFilters";

type AppointmentWithCategory = Appointment & {
  category_data?: Category;
  appointment_assignee?: AppointmentAssignee[];
};

export default function WeekView() {
  const [appointments, setAppointments] = useState<AppointmentWithCategory[]>([]);
  const { currentDate } = useDateContext();
  const { summaryStats, appointments: globalAppointments } = useAppointmentData();
  const { categories = [] } = useCategories();
  const { patients: filterPatients = [] } = usePatients();
  const { relatives: filterRelatives = [] } = useRelatives();
  const { category, patient, date, status, month, search } = useCalendarFilters();
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const [editAppt, setEditAppt] = useState<AppointmentWithCategory | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  // Store current userId and userEmail for permission checks
  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  // Add state for patients, relatives, assignees, activities
  const [patients, setPatients] = useState<Patient[]>([]);
  const [relatives, setRelatives] = useState<Relative[]>([]);
  const [assignees, setAssignees] = useState<AppointmentAssignee[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [ownerUsers, setOwnerUsers] = useState<{ id: string, email: string }[]>([]);

  const { randomBgColor } = useAppointmentColor();
  const queryClient = useQueryClient();
  const filteredAppointments = useMemo(
    () =>
      applyCalendarFilters(
        appointments,
        { category, patient, date, status, month, search },
        filterPatients,
        filterRelatives
      ),
    [appointments, category, patient, date, status, month, search, filterPatients, filterRelatives]
  );
  const filteredGlobalAppointments = useMemo(
    () =>
      applyCalendarFilters(
        globalAppointments,
        { category, patient, date, status, month, search },
        filterPatients,
        filterRelatives
      ),
    [globalAppointments, category, patient, date, status, month, search, filterPatients, filterRelatives]
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

  useEffect(() => {
    // Fetch all patients, relatives, assignees, and activities for mapping
    (async () => {
      try {
        const [patsRes, relsRes, assignsRes, actsRes] = await Promise.all([
          fetch("/api/patients"),
          fetch("/api/relatives"),
          fetch("/api/appointment-assignees"),
          fetch("/api/activities"),
        ]);
        const patsData = await patsRes.json();
        const relsData = await relsRes.json();
        const assignsData = await assignsRes.json();
        const actsData = await actsRes.json();
        setPatients(patsData.patients || []);
        setRelatives(relsData.relatives || []);
        setAssignees(assignsData.assignees || []);
        setActivities(actsData.activities || []);
      } catch (error) {
        console.error("Error loading initial data:", error);
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const response = await fetch("/api/auth/me");
        let uid: string | null = null;
        let email: string | null = null;
        if (response.ok) {
          const data = await response.json();
          uid = data?.user?.id || null;
          email = data?.user?.email || null;
          setUserId(uid);
          setUserEmail(email);
        }
        if (!uid && !email) {
          return;
        }

        // Fetch owned appointments (API automatically filters by authenticated user)
        const ownedRes = await fetch("/api/appointments");
        const ownedData = await ownedRes.json();
        const owned = ownedData.appointments || [];

        // Fetch categories and assignees separately for joining
        const [categoriesRes, allAssigneesRes] = await Promise.all([
          fetch("/api/categories"),
          fetch("/api/appointment-assignees"),
        ]);
        const categoriesData = await categoriesRes.json();
        const allAssigneesData = await allAssigneesRes.json();
        const categories = categoriesData.categories || [];
        const allAssignees = allAssigneesData.assignees || [];

        // Join categories and assignees with appointments
        const ownedWithCategories = owned.map((appt: Appointment) => ({
          ...appt,
          category_data: categories.find((c: Category) => c.id === appt.category),
        }));
        const ownedWithAssignees = ownedWithCategories.map((appt: Appointment) => ({
          ...appt,
          appointment_assignee: allAssignees.filter((a: AppointmentAssignee) => a.appointment === appt.id),
        }));

        // --- NEW: Fetch dashboard access for invited users ---
        const dashboardAccessRes = await fetch("/api/dashboard-access?status=accepted");
        const dashboardAccessData = await dashboardAccessRes.json();
        const dashboardAccess = dashboardAccessData.dashboard_access || [];
        type DashboardAccessRow = { owner_user_id: string };
        let sharedAppointments: AppointmentWithCategory[] = [];
        if (dashboardAccess && dashboardAccess.length > 0) {
          const ownerIds = (dashboardAccess as DashboardAccessRow[]).map((d) => d.owner_user_id).filter(Boolean);
          // Fetch appointments for each owner (API filters by authenticated user, so we need to fetch individually)
          const sharedPromises = ownerIds.map(async (ownerId: string) => {
            // Note: Current API filters by authenticated user, so we can't fetch other users' appointments directly
            // This would require a new API route that allows fetching by owner_user_id with proper permissions
            // For now, we'll skip shared appointments from dashboard access
            return [];
          });
          const sharedResults = await Promise.all(sharedPromises);
          sharedAppointments = sharedResults.flat() as AppointmentWithCategory[];
        }

        // Fetch assigned appointments by user and email
        const assignedByUser = allAssignees.filter(
          (a: AppointmentAssignee) => a.user === uid && a.status === "accepted"
        );
        const assignedByEmail = email
          ? allAssignees.filter(
            (a: AppointmentAssignee) => a.invited_email === email && a.status === "accepted"
          )
          : [];

        // Fetch appointment data for assigned appointments
        const assignedAppointmentIds = [
          ...assignedByUser.map((a: AppointmentAssignee) => a.appointment),
          ...assignedByEmail.map((a: AppointmentAssignee) => a.appointment),
        ].filter(Boolean);
        const uniqueAppointmentIds = [...new Set(assignedAppointmentIds)];

        const assignedAppointmentsData = await Promise.all(
          uniqueAppointmentIds.map(async (apptId: string) => {
            const res = await fetch(`/api/appointments/${apptId}`);
            if (res.ok) {
              const data = await res.json();
              return data.appointment;
            }
            return null;
          })
        );

        // Merge assigned appointments with assignee data
        type AppointmentWithAssignees = AppointmentWithCategory & { appointment_assignee?: AppointmentAssignee[] };
        const assignedAppointments: AppointmentWithAssignees[] = assignedAppointmentsData
          .filter(Boolean)
          .map((appt: Appointment) => {
            const relatedAssignees = [
              ...assignedByUser.filter((a: AppointmentAssignee) => a.appointment === appt.id),
              ...assignedByEmail.filter((a: AppointmentAssignee) => a.appointment === appt.id),
            ].filter((a) => typeof a.permission === "string" && ["read", "write", "full"].includes(a.permission));

            return {
              ...appt,
              category_data: categories.find((c: Category) => c.id === appt.category),
              appointment_assignee: relatedAssignees,
            };
          });

        // Collect all unique user IDs from appointments to get owner emails
        const allUserIds = new Set<string>();
        ownedWithAssignees.forEach((appt: Appointment) => {
          if (appt.user_id) allUserIds.add(appt.user_id);
        });
        sharedAppointments.forEach((appt: Appointment) => {
          if (appt.user_id) allUserIds.add(appt.user_id);
        });
        assignedAppointments.forEach((appt: Appointment) => {
          if (appt.user_id) allUserIds.add(appt.user_id);
        });

        // Fetch user data for all owners (using search API)
        const ownerUsersPromises = Array.from(allUserIds).map(async (userId: string) => {
          const res = await fetch(`/api/users/search?query=${userId}`);
          if (res.ok) {
            const data = await res.json();
            const user = data.users?.find((u: { id: string }) => u.id === userId);
            return user ? { id: user.id, email: user.email } : null;
          }
          return null;
        });
        const ownerUsersResults = await Promise.all(ownerUsersPromises);
        const allOwnerUsers = ownerUsersResults.filter(Boolean) as { id: string; email: string }[];

        setOwnerUsers(allOwnerUsers || []);
        // Merge and deduplicate, always include all assignees for each appointment
        const allAppointments: AppointmentWithAssignees[] = [
          ...ownedWithAssignees,
          ...sharedAppointments,
          ...assignedAppointments,
        ].map((appt) => ({ ...appt }));
        const deduped: AppointmentWithAssignees[] = allAppointments.reduce(
          (acc: AppointmentWithAssignees[], curr: AppointmentWithAssignees) => {
            if (!curr || !curr.id) return acc;
            const existing = acc.find((a) => a.id === curr.id);
            if (existing) {
              existing.appointment_assignee = [
                ...(existing.appointment_assignee || []),
                ...(curr.appointment_assignee || []),
              ].filter((v, i, arr) => v && v.id && arr.findIndex((b) => b.id === v.id) === i);
            } else {
              acc.push(curr);
            }
            return acc;
          },
          []
        );
        if (deduped) setAppointments(deduped as AppointmentWithCategory[]);
      } catch (error) {
        console.error("Error fetching appointments:", error);
      }
    })();
  }, [currentDate]);

  // Helper: get permission for current user on an appointment
  // Use shared permission helper
  function getUserPermission(
    appt: AppointmentWithCategory & { appointment_assignee?: AppointmentAssignee[] },
    uid: string | null
  ): "owner" | "full" | "write" | "read" | null {
    return getUserAppointmentPermission({
      appointment: appt,
      assignees: appt.appointment_assignee,
      userId: uid,
    });
  }

  const toggleStatus = async (id: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/appointments/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (response.ok) {
        setAppointments((prev) =>
          prev.map((a) =>
            a.id === id ? { ...a, status: newStatus as typeof a.status } : a
          )
        );
        queryClient.setQueryData<FullAppointment[]>(
          queryKeys.appointments.all,
          (old = []) =>
            old.map((a) =>
              a.id === id ? { ...a, status: newStatus as FullAppointment["status"] } : a
            )
        );
        void invalidateAllForCrud(queryClient);
      } else {
        console.error("Failed to update appointment status");
      }
    } catch (error) {
      console.error("Error updating appointment status:", error);
    }
  };

  const deleteAppt = async (id: string) => {
    if (!confirm("Delete appointment?")) return;
    try {
      const response = await fetch(`/api/appointments/${id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        setAppointments((prev) => prev.filter((a) => a.id !== id));
        queryClient.setQueryData<FullAppointment[]>(
          queryKeys.appointments.all,
          (old = []) => old.filter((a) => a.id !== id)
        );
        void invalidateAllForCrud(queryClient);
      } else {
        console.error("Failed to delete appointment");
      }
    } catch (error) {
      console.error("Error deleting appointment:", error);
    }
  };

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
        <Badge variant="outline" className="ml-2 bg-green-100 text-green-700 hover:bg-green-100 border-transparent">
          Today
        </Badge>
      );
    if (diffDays === 1)
      return (
        <Badge variant="outline" className="ml-2 bg-yellow-100 text-yellow-800 hover:bg-yellow-100 border-transparent">
          Next Day
        </Badge>
      );
    if (diffDays > 1)
      return (
        <Badge variant="outline" className="ml-2 bg-sky-100 text-sky-700 hover:bg-sky-100 border-transparent">
          Some Day Later
        </Badge>
      );
    if (diffDays < 0)
      return (
        <Badge variant="outline" className="ml-2 bg-gray-200 text-gray-500 hover:bg-gray-200 border-transparent">
          Date Passed
        </Badge>
      );
    return null;
  }

  // --- UI update: Only one outer scrollbar, calendar stretches naturally ---
  // Set hourHeight and dayWidth for grid and card calculations
  const hourHeight = 64; // px per hour
  const dayWidth = 240; // px per day column, increased for better fit
  const headerRowHeight = hourHeight; // px, matches hour row height for now

  // --- Real-time red current time line feature ---
  // State for current time (updates every minute)
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  // Helper: is today in this week?
  const isTodayInWeek = () => {
    const weekEnd = addDays(weekStart, 6);
    return now >= weekStart && now <= weekEnd;
  };

  // Helper: get position of red line (in px from top)
  const getRedLinePosition = () => {
    const hour = now.getHours();
    const minute = now.getMinutes();
    return hour * hourHeight + (minute / 60) * hourHeight;
  };

  const handleEditDialogChange = (open: boolean) => {
    setEditOpen(open);
    if (!open) setEditAppt(null);
  };

  const showWeekNowLine = isTodayInWeek();
  const weekIndicatorTopPx = showWeekNowLine
    ? headerRowHeight + getRedLinePosition()
    : 0;

  const apptBlockRef = useCallback((el: HTMLDivElement | null, slotTop: number, slotHeight: number) => {
    if (el) {
      el.style.top = `${slotTop}px`;
      el.style.height = `${slotHeight}px`;
    }
  }, []);

  return (
    <div className="min-h-0 py-4 px-2 sm:px-4 lg:px-8">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <h2 className="text-xl font-semibold tracking-tight text-gray-700">
          {weekTitle}
        </h2>
        <Badge variant="outline" className="min-h-6 min-w-[90px] justify-center border-transparent bg-sky-100 text-sky-700 hover:bg-sky-100">Total: {summaryStats.total}</Badge>
        <Badge variant="outline" className="min-h-6 min-w-[90px] justify-center border-transparent bg-cyan-100 text-cyan-700 hover:bg-cyan-100">This Week: {weekAppointments.length}</Badge>
        <Badge variant="outline" className="min-h-6 min-w-[90px] justify-center border-transparent bg-green-100 text-green-700 hover:bg-green-100">Today: {weekTodayCount}</Badge>
        <span className="px-1 text-xs font-semibold text-gray-500">Status:</span>
        <Badge variant="outline" className="min-h-6 min-w-[90px] justify-center border-transparent bg-amber-100 text-amber-700 hover:bg-amber-100">Open: {weekStatus.open}</Badge>
        <Badge variant="outline" className="min-h-6 min-w-[90px] justify-center border-transparent bg-rose-100 text-rose-700 hover:bg-rose-100">Alert: {weekStatus.alert}</Badge>
        <Badge variant="outline" className="min-h-6 min-w-[90px] justify-center border-transparent bg-emerald-100 text-emerald-700 hover:bg-emerald-100">Done: {weekStatus.done}</Badge>
      </div>
      <GlobalCalendarFilters categories={categories} patients={filterPatients} className="mb-3" />
      <div className="week-scroll-container overflow-hidden rounded-2xl border border-gray-200 bg-background">
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
                  {format(now, "HH:mm")}
                </span>
              </div>
            </div>
          )}
          {/* Top-left sticky cell */}
          <div className="bg-gray-50 border-r border-b week-sticky-corner" />

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
                className={"border-r border-b p-2 text-center font-medium text-gray-600 week-day-header" + (isToday && isCurrentWeek ? " week-day-header-today" : "")}
              >
                {format(day, "EEE dd.MM.")}
                {isToday && isCurrentWeek && (
                  <Badge variant="outline" className="ml-2 bg-green-100 text-green-700 hover:bg-green-100 border-transparent">
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
                className="border-r border-b px-2 py-2 text-xs text-gray-500 week-hour-cell"
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
                const matches = filteredAppointments.filter((a) => {
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
                    className={"border-r border-b relative week-slot-cell" + (isTodayCol ? " week-slot-today" : "")}
                  >
                    {/* Inject your code here: */}
                    {matches.map((a) => {
                      const color = randomBgColor(a.id);
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
                            patients={patients}
                            relatives={relatives}
                            assignees={assignees.filter((ass) => ass.appointment === a.id)}
                            activities={activities}
                            userEmail={userEmail}
                            userId={userId}
                            ownerUsers={ownerUsers}
                            getDateTag={getDateTag}
                            onEdit={setEditAppt}
                            onDelete={deleteAppt}
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

      {/* Edit dialog */}
      {editAppt && (
        <AppointmentDialogController
          appointment={editAppt}
          onSuccess={() => {
            setEditAppt(null);
            void invalidateAllForCrud(queryClient);
            void (async () => {
              try {
                const response = await fetch("/api/appointments");
                if (response.ok) {
                  const data = await response.json();
                  const appointments = data.appointments || [];
                  const categoriesRes = await fetch("/api/categories");
                  const categoriesData = await categoriesRes.json();
                  const categories = categoriesData.categories || [];
                  const appointmentsWithCategories = appointments.map((appt: Appointment) => ({
                    ...appt,
                    category_data: categories.find((c: Category) => c.id === appt.category),
                  }));
                  setAppointments(appointmentsWithCategories);
                }
              } catch (error) {
                console.error("Error refreshing appointments:", error);
              }
            })();
          }}
          isOpen={editOpen}
          onOpenChange={handleEditDialogChange}
        />
      )}
    </div>
  );
}
