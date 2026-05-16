"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import { format } from "date-fns";
import { FullAppointment } from "@/hooks/useAppointments";
import { useCategories } from "@/hooks/useCategories";
import { usePatients } from "@/hooks/usePatients";
import { useAuth } from "@/hooks/useAuth";
import { useAppointmentData } from "@/context/AppointmentDataContext";
import {
  useCalendarFilters,
  applyCalendarFilters,
} from "@/context/CalendarFiltersContext";
import { summarizeDayAppointments } from "@/lib/appointment-stats";
import {
  Patient,
  AppointmentAssignee,
} from "@/types/types";
import Filters from "./Filters";
import AppointmentDialogController from "./AppointmentDialogController";
import { useDateContext } from "@/context/DateContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  MoreVertical,
  CheckCircle,
  Circle,
  CalendarCheck2,
  CalendarClock,
  CalendarX2,
  CalendarDays,
  ChevronDown,
  Video,
} from "lucide-react";
import { getUserAppointmentPermission } from "@/lib/permissions";
import VideoCall from "./VideoCall";
// Using Vercel Blob for file storage
import { getPublicUrl } from "@/lib/vercelBlob";
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
import { MdCategory } from "react-icons/md";
import GlobalCalendarFilters from "./GlobalCalendarFilters";
import { useAppointmentColor } from "@/context/AppointmentColorContext";
import { AppointmentListColorBar } from "@/components/shared/AppointmentListColorBar";
import { motion } from "framer-motion";
import { RoleEntityLink } from "@/components/shared/RoleEntityLink";
import CalendarStickyHeader from "./CalendarStickyHeader";
import { ConfirmActionDialog } from "@/components/shared/ConfirmActionDialog";

// Types imported from hooks

// Reusable component for date headline
function StatBadge({
  label,
  value,
  className,
}: {
  label: string;
  value: number;
  className: string;
}) {
  return (
    <Badge
      variant="outline"
      className={`calendar-glass-badge min-h-6 min-w-[90px] justify-center ${className}`}
    >
      {label}: {value}
    </Badge>
  );
}

function DateHeadline({
  date,
  dayStats,
}: {
  date: Date;
  dayStats: { total: number; open: number; alert: number; done: number };
}) {
  return (
    <div className="mt-8 mb-3 flex flex-wrap items-center gap-2">
      <div className="text-lg font-bold text-gray-700">
        {new Intl.DateTimeFormat("de-DE", {
          weekday: "long",
          day: "numeric",
          month: "long",
        }).format(date)}
      </div>
      {(() => {
        const now = new Date();
        if (
          date.getFullYear() === now.getFullYear() &&
          date.getMonth() === now.getMonth() &&
          date.getDate() === now.getDate()
        ) {
          return (
            <Badge variant="outline" className="calendar-glass-badge calendar-glass-badge-emerald">
              Today
            </Badge>
          );
        }
        return null;
      })()}
      <StatBadge label="Total" value={dayStats.total} className="calendar-glass-badge-sky" />
      <StatBadge label="Open" value={dayStats.open} className="calendar-glass-badge-amber" />
      <StatBadge label="Alert" value={dayStats.alert} className="calendar-glass-badge-rose" />
      <StatBadge label="Done" value={dayStats.done} className="calendar-glass-badge-emerald" />
    </div>
  );
}

// Helper to group appointments by date (ascending, today first)
function groupAppointmentsByDate(appts: FullAppointment[]) {
  const groups: { [date: string]: FullAppointment[] } = {};
  appts.forEach((appt) => {
    const d = new Date(appt.start);
    d.setHours(0, 0, 0, 0);
    const key = d.toISOString();
    if (!groups[key]) groups[key] = [];
    groups[key].push(appt);
  });

  // Removed stray today.setHours(0, 0, 0, 0); // 'today' is not defined here and not needed
  const sortedKeys = Object.keys(groups).sort((a, b) => {
    const da = new Date(a);
    const db = new Date(b);
    return da.getTime() - db.getTime();
  });
  return sortedKeys.map((key) => ({ date: new Date(key), appts: groups[key] }));
}

// Day tags helper (Today, Tomorrow, Later, Passed)
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

type ListSectionKey = "today" | "tomorrow" | "passed" | "later";

function dayDiffFromToday(date: Date) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return Math.floor((d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

export default function AppointmentList() {
  const { user } = useAuth();

  // Edit Dialog State
  const [editAppt, setEditAppt] = useState<FullAppointment | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { currentDate } = useDateContext();
  const { getAppointmentColorToken } = useAppointmentColor();

  // Queries
  const {
    appointments,
    isLoading: loadingAppointments,
    isFetching: fetchingAppointments,
    deleteAppointment,
    toggleStatus,
    refetch: refetchAppointments,
    summaryStats,
  } = useAppointmentData();

  const { categories = [] } = useCategories();
  const { patients = [] } = usePatients();
  const { category, patient, date, status, month, search } = useCalendarFilters();

  // Keep ownerUsers state empty for now, or we can fetch them separately if needed, 
  // but useAppointments currently just returns user IDs. We'll simplify to just showing the user ID or email if invited_email is populated.
  const [ownerUsers, setOwnerUsers] = useState<{ id: string, email: string }[]>([]);
  const [collapsedSections, setCollapsedSections] = useState<Record<ListSectionKey, boolean>>({
    today: false,
    tomorrow: false,
    passed: true,
    later: false,
  });

  // We can fetch owner users for shared appointments if needed, 
  // but for now we'll just rely on the existing invited_email or user_id.
  useEffect(() => {
    // Optional: Fetch emails for owner users if this is a shared appointment
    // This is a simplified version of the previous logic.
  }, [appointments]);

  const filteredBySidebar = useMemo(
    () =>
      applyCalendarFilters(
        appointments,
        { category, patient, date, status, month, search: "" },
        patients
      ),
    [appointments, category, patient, date, status, month, patients]
  );

  // Helper: get permission for current user on an appointment
  function getUserPermission(appt: FullAppointment): "owner" | "full" | "write" | "read" | null {
    return getUserAppointmentPermission({
      appointment: appt,
      assignees: appt.appointment_assignee,
      userId: user?.id,
    });
  }

  const handleToggleStatus = (id: string, newStatus: string) => {
    // Only pass id and status, casting generic string to required union
    toggleStatus({ id, status: newStatus as "pending" | "done" | "alert" });
  };

  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  const handleDelete = (id: string) => {
    setDeleteTargetId(id);
  };

  const isEmpty = filteredBySidebar.length === 0;

  // Filtered appointments based on search
  const filteredAppointments = filteredBySidebar.filter((appt) => {
    if (!search.trim()) return true;
    const lower = search.toLowerCase();
    // Helper to check if a string includes the search
    const match = (val?: string | null) => !!val && val.toLowerCase().includes(lower);
    // Check all relevant fields
    // Patient name: handle both patient_data and patient as object
    let patientNameMatch = false;
    if (appt.patient_data) {
      patientNameMatch =
        !!match(appt.patient_data.firstname) ||
        !!match(appt.patient_data.lastname) ||
        !!match(appt.patient_data.email);
    } else if (
      appt.patient &&
      typeof appt.patient === "object" &&
      "firstname" in appt.patient &&
      "lastname" in appt.patient
    ) {
      const patientObj = appt.patient as {
        firstname?: string;
        lastname?: string;
      };
      patientNameMatch =
        !!match(patientObj.firstname) || !!match(patientObj.lastname);
    } else if (typeof appt.patient === "string") {
      // If patient is a string ID, try to find it in the patients list
      const p = patients.find((p: Patient) => p.id === appt.patient);
      if (p) {
        patientNameMatch = !!match(p.firstname) || !!match(p.lastname);
      }
    }

    // Also search within patient names directly from the fetched list
    const patientNameListMatch = patients.some((p: Patient) =>
      (`${p.firstname} ${p.lastname}`).toLowerCase().includes(lower)
    );

    return (
      match(appt.title) ||
      match(appt.notes) ||
      match(appt.location) ||
      match(appt.status) ||
      (appt.category_data &&
        (match(appt.category_data.label) ||
          match(appt.category_data.description))) ||
      patientNameMatch ||
      patientNameListMatch ||
      (appt.appointment_assignee &&
        appt.appointment_assignee.some((a: AppointmentAssignee) => a.user && match(a.user))) ||
      (appt.attachments && appt.attachments.some((a: string) => match(a)))
    );
  });

  const handleEditSuccess = () => {
    setEditAppt(null);
    void refetchAppointments();
  };

  const handleEdit = (appt: FullAppointment) => {
    setEditAppt(appt);
    setEditOpen(true);
  };
  const handleEditDialogChange = (open: boolean) => {
    setEditOpen(open);
    if (!open) setEditAppt(null);
  };

  // --- DEBUG: Vercel Blob storage doesn't require bucket listing ---
  // Files are stored with URLs directly
  // Removed Supabase Storage bucket listing code

  // Group appointments by date (descending)
  const grouped = groupAppointmentsByDate(filteredAppointments);
  const groupedWithTodayFirst = useMemo(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const todayIdx = grouped.findIndex((g) => {
      const d = new Date(g.date);
      d.setHours(0, 0, 0, 0);
      return d.getTime() === now.getTime();
    });
    if (todayIdx <= 0) return grouped;
    const copy = [...grouped];
    const [todayGroup] = copy.splice(todayIdx, 1);
    return [todayGroup, ...copy];
  }, [grouped]);

  const groupedSections = useMemo(() => {
    const today: { date: Date; appts: FullAppointment[] }[] = [];
    const tomorrow: { date: Date; appts: FullAppointment[] }[] = [];
    const passed: { date: Date; appts: FullAppointment[] }[] = [];
    const later: { date: Date; appts: FullAppointment[] }[] = [];

    groupedWithTodayFirst.forEach((group) => {
      const diff = dayDiffFromToday(group.date);
      if (diff === 0) today.push(group);
      else if (diff === 1) tomorrow.push(group);
      else if (diff < 0) passed.push(group);
      else later.push(group);
    });

    return { today, tomorrow, passed, later };
  }, [groupedWithTodayFirst]);

  const sectionConfig = useMemo(
    () => [
      {
        key: "today" as const,
        title: "Today's Appointments",
        subtitle: "Scheduled for today",
        icon: CalendarCheck2,
        headerClass:
          "border-emerald-300/55 bg-gradient-to-r from-emerald-50 via-emerald-50/80 to-emerald-100/70",
        iconClass: "border-emerald-200 bg-emerald-100 text-emerald-700",
        countClass: "bg-emerald-100 text-emerald-700",
        emptyMessage: "No appointments for today.",
      },
      {
        key: "tomorrow" as const,
        title: "Tomorrow",
        subtitle: "Upcoming appointments for Tomorrow",
        icon: CalendarClock,
        headerClass:
          "border-blue-300/55 bg-gradient-to-r from-blue-50 via-blue-50/80 to-sky-100/70",
        iconClass: "border-blue-200 bg-blue-100 text-blue-700",
        countClass: "bg-blue-100 text-blue-700",
        emptyMessage: "No appointments planned for tomorrow.",
      },
      {
        key: "passed" as const,
        title: "Passed Days",
        // Auto-cleanup note: past appointments are purged on the 1st of each month via cron.
        subtitle: "Previous appointments · Auto-deleted on the 1st of each month",
        icon: CalendarX2,
        headerClass:
          "border-gray-300/55 bg-gradient-to-r from-gray-50 via-gray-50/80 to-slate-100/70",
        iconClass: "border-gray-200 bg-gray-100 text-gray-700",
        countClass: "bg-gray-200 text-gray-700",
        emptyMessage: "No passed appointments.",
      },
      {
        key: "later" as const,
        title: "Later",
        subtitle: "Future appointments after tomorrow",
        icon: CalendarDays,
        headerClass:
          "border-violet-300/55 bg-gradient-to-r from-violet-50 via-violet-50/80 to-violet-100/70",
        iconClass: "border-violet-200 bg-violet-100 text-violet-700",
        countClass: "bg-violet-100 text-violet-700",
        emptyMessage: "No later appointments.",
      },
    ],
    []
  );

  const toggleSection = (key: ListSectionKey) => {
    setCollapsedSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };
  return (
    <div className="pt-0 px-2 sm:px-4 lg:px-8 pb-8">
      {/* Sticky top rows: title/badges + filters */}
      <CalendarStickyHeader >
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <h2 className="text-xl font-semibold tracking-tight text-gray-700">
            Appointment List
          </h2>
          <StatBadge label="Total" value={summaryStats.total} className="calendar-glass-badge-sky" />
          <StatBadge label="Today" value={summaryStats.today} className="calendar-glass-badge-emerald" />
          <StatBadge label="Tomorrow" value={summaryStats.nextDay} className="calendar-glass-badge-blue" />
          <StatBadge label="Later" value={summaryStats.later} className="calendar-glass-badge-violet" />
          <StatBadge label="Passed Days" value={summaryStats.passed} className="calendar-glass-badge-slate" />
          <span className="px-1 text-xs font-semibold text-gray-500">Status:</span>
          <StatBadge label="Open" value={summaryStats.open} className="calendar-glass-badge-amber" />
          <StatBadge label="Alert" value={summaryStats.alert} className="calendar-glass-badge-rose" />
          <StatBadge label="Done" value={summaryStats.done} className="calendar-glass-badge-emerald" />
        </div>
        <GlobalCalendarFilters categories={categories} patients={patients} />
      </CalendarStickyHeader>

      {/* Data area — skeleton while loading, real content once ready */}
      {loadingAppointments ? (
        <div className="animate-pulse mt-8 flex flex-col gap-4">
          <div className="h-6 w-56 bg-gray-200 rounded mb-1" />
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="relative rounded-2xl bg-white border border-gray-100 flex items-stretch min-h-[130px]">
              <div className="w-1.5 rounded-l-2xl h-full absolute left-0 top-0 bottom-0 bg-gray-200" />
              <div className="pl-6 pr-4 py-4 flex-1 flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <div className="h-5 w-36 bg-gray-200 rounded-2xl" />
                  <div className="h-5 w-20 bg-gray-100 rounded-full" />
                </div>
                <div className="flex items-center gap-4">
                  <div className="h-4 w-28 bg-gray-100 rounded" />
                  <div className="h-4 w-24 bg-gray-100 rounded" />
                </div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                  <div className="h-3.5 w-32 bg-gray-100 rounded" />
                  <div className="h-3.5 w-28 bg-gray-100 rounded" />
                  <div className="h-3.5 w-24 bg-gray-100 rounded" />
                  <div className="h-3.5 w-20 bg-gray-100 rounded" />
                </div>
              </div>
              <div className="flex flex-col items-center justify-center gap-3 min-w-[68px] py-4 px-3 border-l border-gray-100">
                <div className="h-9 w-20 bg-gray-100 rounded-2xl" />
                <div className="h-8 w-8 bg-gray-100 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <>
          {/* Show empty state only once data has settled — guards against flash */}
          {appointments.length === 0 && !fetchingAppointments && (
            <div className="flex min-h-[50vh] items-center justify-center px-4">
              <div className="mx-auto w-full max-w-md rounded-3xl border border-slate-200/80 bg-white/90 px-6 py-8 text-center shadow-[0_20px_50px_rgba(15,23,42,0.08)] backdrop-blur-sm">
                {/* Friendly empty state for first-run or cleared database */}
                <div className="mx-auto mb-4 inline-flex size-12 items-center justify-center rounded-2xl border border-sky-200/70 bg-sky-50/90 text-sky-600">
                  <CalendarX2 className="size-6" aria-hidden />
                </div>
                <h3 className="text-base font-semibold tracking-tight text-slate-800">
                  No appointments yet
                </h3>
                <p className="mt-1 text-sm leading-relaxed text-slate-500">
                  Start by creating your first appointment using the{" "}
                  <span className="font-medium text-slate-600">New Appointment</span> button.
                </p>
              </div>
            </div>
          )}

          {/* Only show the 'Kein Treffer gefunden' message if there are appointments but none match the filter/search */}
          {appointments.length > 0 && filteredAppointments.length === 0 && (
            <div className="flex items-center justify-center min-h-[40vh]">
              <div className="text-center text-gray-500 text-lg">
                ❌ No matches found for your search for &quot;{search}&quot;
              </div>
            </div>
          )}

          {/* Render grouped appointments */}

          {filteredAppointments.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col gap-4"
            >
              {sectionConfig.map((section) => {
                const groups = groupedSections[section.key];
                const sectionCount = groups.reduce((acc, g) => acc + g.appts.length, 0);
                const isCollapsed = collapsedSections[section.key];
                const SectionIcon = section.icon;
                return (
                  <div
                    key={section.key}
                    className={`overflow-hidden rounded-2xl border ${section.headerClass}`}
                  >
                    <button
                      type="button"
                      aria-expanded={!isCollapsed}
                      onClick={() => toggleSection(section.key)}
                      className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-white/35"
                    >
                      <span className={`flex h-9 w-9 items-center justify-center rounded-2xl border ${section.iconClass}`}>
                        <SectionIcon className="h-4.5 w-4.5" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-sm font-semibold text-gray-700">{section.title}</p>
                          <Badge variant="outline" className={`border-transparent ${section.countClass}`}>
                            {sectionCount}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-500">{section.subtitle}</p>
                      </div>
                      <span className="inline-flex h-7 w-24 shrink-0 items-center justify-center gap-1 rounded-full bg-white/70 px-2 text-xs font-medium text-gray-700 shadow-lg">
                        <ChevronDown
                          className={`h-3.5 w-3.5 shrink-0 transition-transform duration-200 ease-out will-change-transform ${isCollapsed ? "-rotate-90" : "rotate-0"}`}
                          aria-hidden
                        />
                        <span className="whitespace-nowrap text-center">{isCollapsed ? "Expand" : "Collapse"}</span>
                      </span>
                    </button>

                    <motion.div
                      initial={false}
                      animate={isCollapsed ? { height: 0, opacity: 0 } : { height: "auto", opacity: 1 }}
                      transition={{ duration: 0.25, ease: "easeInOut" }}
                      className="overflow-hidden bg-white/95"
                    >
                      <div className="px-3 pb-3">
                        {groups.length === 0 ? (
                          <div className="mt-2 flex items-center gap-2 rounded-2xl border border-dashed border-gray-300/80 bg-gray-50/80 px-3 py-2.5 text-sm text-gray-500">
                            <SectionIcon className="h-4 w-4 text-gray-400" />
                            <span>{section.emptyMessage}</span>
                          </div>
                        ) : (
                          groups.map(({ date, appts }) => (
                            <div key={`${section.key}-${date.toISOString()}`}>
                              <DateHeadline date={date} dayStats={summarizeDayAppointments(appts)} />
                              <div className="flex flex-col gap-4">
                                {appts.map((appt: FullAppointment, i: number) => {
                                  // --- Begin: Restored full-featured appointment card ---
                                  const start = new Date(appt.start);
                                  const now = new Date();
                                  const isToday =
                                    start.getFullYear() === now.getFullYear() &&
                                    start.getMonth() === now.getMonth() &&
                                    start.getDate() === now.getDate();
                                  const colorToken = getAppointmentColorToken(
                                    appt.id,
                                    appt.category_data?.color ?? null
                                  );
                                  const isDone = appt.status === "done";
                                  const categoryIcon = appt.category_data?.icon ? (
                                    <span className="inline-flex items-center mr-1">
                                      <MdCategory className="w-4 h-4 text-gray-400" />
                                    </span>
                                  ) : null;

                                  // Deduplicate assignees by user + invited_email
                                  const filteredAssignees = appt.appointment_assignee || [];
                                  const dedupedMap = new Map();
                                  for (const ass of filteredAssignees) {
                                    const key = `${ass.user || ""}|${ass.invited_email || ""}`;
                                    if (!dedupedMap.has(key)) {
                                      dedupedMap.set(key, ass);
                                      continue;
                                    }
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
                                  const dedupedAssignees = Array.from(dedupedMap.values());

                                  return (
                                    <motion.div
                                      key={appt.id}
                                      data-today={isToday ? "true" : undefined}
                                      ref={isToday && i === 0 ? scrollRef : null}
                                      initial={{ opacity: 0, y: 14 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      transition={{ duration: 0.32, delay: i * 0.07 }}
                                      className="relative rounded-2xl border shadow-md hover:shadow-xl transition-all duration-200 p-0 flex items-stretch min-h-[130px]"
                                      style={{
                                        backgroundColor: colorToken.cardBgColor,
                                        borderColor: colorToken.cardBorderColor,
                                      }}
                                    >
                                      {/* Color bar */}
                                      <AppointmentListColorBar color={colorToken.lineColor} />

                                      {/* Main content */}
                                      <div className="pl-6 pr-4 py-3 flex-1 flex flex-col gap-2 min-w-0">

                                        {/* Row 1: Title + date tag */}
                                        <div className="flex items-center gap-2 flex-wrap">
                                          <RoleEntityLink
                                            kind="appointment"
                                            id={appt.id}
                                            label={appt.title}
                                            className={`text-md font-medium ${isDone ? "line-through text-gray-400" : ""}`}
                                          />
                                          {getDateTag(start)}
                                        </div>

                                        {/* Row 2: Date · Time · Location */}
                                        <div className="flex items-center gap-5 flex-wrap text-sm text-gray-600">
                                          <span className="flex items-center gap-1.5 shrink-0">
                                            <svg width="13" height="13" fill="none" viewBox="0 0 24 24" className="text-gray-400 shrink-0"><path d="M8 7V3M16 7V3M3 11H21M5 19H19C20.1046 19 21 18.1046 21 17V7C21 5.89543 20.1046 5 19 5H5C3.89543 5 3 5.89543 3 7V17C3 18.1046 3.89543 19 5 19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                                            <span className="text-gray-400 text-xs">Date:</span>
                                            <span className={`text-xs ${isDone ? "line-through text-gray-400" : "text-gray-700 font-medium"}`}>{format(start, "dd.MM.yyyy")}</span>
                                          </span>
                                          <span className="flex items-center gap-1.5 shrink-0">
                                            <svg width="13" height="13" fill="none" viewBox="0 0 24 24" className="text-gray-400 shrink-0"><path d="M12 6V12L16 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" /></svg>
                                            <span className="text-gray-400 text-xs">Time:</span>
                                            <span className={`text-xs ${isDone ? "line-through text-gray-400" : "text-gray-700 font-medium"}`}>{format(start, "HH:mm")} – {format(new Date(appt.end), "HH:mm")}</span>
                                          </span>
                                          <span className="flex items-center gap-1.5 min-w-0">
                                            <FiMapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                                            <span className="text-gray-400 text-xs shrink-0">Location:</span>
                                            <span className="text-xs text-gray-700 font-medium truncate">{appt.location || "--"}</span>
                                          </span>
                                        </div>

                                        {/* Row 3: Client · Category · Status */}
                                        <div className="flex items-center gap-5 flex-wrap">
                                          <span className="flex items-center gap-1.5 shrink-0">
                                            <FiUser className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                                            <span className="text-gray-400 text-xs shrink-0">Client:</span>
                                            {(() => {
                                              try {
                                                if (!appt.patient) return <span className="text-xs text-gray-700 font-medium">--</span>;
                                                if (typeof appt.patient === "object" && "id" in appt.patient && "firstname" in appt.patient) {
                                                  const p = appt.patient as Patient;
                                                  return (
                                                    <RoleEntityLink
                                                      kind="patient"
                                                      id={p.id}
                                                      label={`${p.firstname} ${p.lastname}`}
                                                      className="text-xs font-medium"
                                                    />
                                                  );
                                                }
                                                if (typeof appt.patient === "string" && patients.length > 0) {
                                                  const p = patients.find((x: Patient) => x.id === appt.patient);
                                                  const label = p && p.firstname && p.lastname ? `${p.firstname} ${p.lastname}` : "--";
                                                  if (p && label !== "--") {
                                                    return (
                                                      <RoleEntityLink
                                                        kind="patient"
                                                        id={p.id}
                                                        label={label}
                                                        className="text-xs font-medium"
                                                      />
                                                    );
                                                  }
                                                }
                                                return <span className="text-xs text-gray-700 font-medium">--</span>;
                                              } catch (error: unknown) {
                                                console.error("Error in client name lookup:", error);
                                                return <span className="text-xs text-gray-700 font-medium">--</span>;
                                              }
                                            })()}
                                          </span>
                                          {appt.category_data && (
                                            <span className="flex items-center gap-1.5 shrink-0">
                                              <MdCategory className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                                              <span className="text-gray-400 text-xs shrink-0">Category:</span>
                                              <RoleEntityLink
                                                kind="category"
                                                id={appt.category_data.id}
                                                label={appt.category_data.label}
                                                className="text-xs font-medium"
                                              />
                                            </span>
                                          )}
                                          <span className="flex items-center gap-1.5 shrink-0">
                                            <FiFlag className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                                            <span className="text-gray-400 text-xs shrink-0">Status:</span>
                                            <span className={`text-xs font-semibold ${appt.status === "done" ? "text-green-600" : appt.status === "alert" ? "text-red-500" : "text-amber-600"}`}>
                                              {appt.status || "pending"}
                                            </span>
                                          </span>
                                          {/* Telehealth badge — shown only when appointment is telehealth */}
                                          {appt.is_telehealth && (
                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-sky-100/80 text-sky-700 border border-sky-200/60 flex-shrink-0">
                                              <Video className="h-3 w-3" />
                                              Telehealth
                                            </span>
                                          )}
                                        </div>

                                        {/* Row 4: Notes (only if present) */}
                                        {appt.notes && (
                                          <div className="flex items-center gap-1.5">
                                            <FiFileText className={`w-3.5 h-3.5 shrink-0 ${isDone ? "text-gray-300" : "text-gray-400"}`} />
                                            <span className="text-gray-400 text-xs shrink-0">Note:</span>
                                            <span className={`text-xs ${isDone ? " text-gray-400" : "text-gray-600"}`}>{appt.notes}</span>
                                          </div>
                                        )}

                                        {/* Attachments (only if present) */}
                                        {appt.attachments && appt.attachments.length > 0 && (
                                          <div className="flex items-center gap-1.5 flex-wrap">
                                            <FiPaperclip className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                                            <span className="text-gray-400 text-xs shrink-0">Attachments:</span>
                                            {appt.attachments.map((file, idx) => {
                                              const publicUrl = getPublicUrl(file);
                                              const fileName = file.split("/").pop() || file;
                                              return publicUrl ? (
                                                <a key={idx} href={publicUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 underline">{fileName}</a>
                                              ) : (
                                                <span key={idx} className="text-xs text-red-500">[File not found]</span>
                                              );
                                            })}
                                          </div>
                                        )}

                                        {/* Assigned by */}
                                        {dedupedAssignees.length > 0 && (
                                          <div className="flex items-center gap-1.5">
                                            <FiUsers className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                                            <span className="text-gray-400 text-xs shrink-0">Assigned by:</span>
                                            {appt.user_id === user?.id ? (
                                              <span className="text-xs text-green-700 font-medium">you ({user?.email || "owner"})</span>
                                            ) : (
                                              <span className="text-xs text-blue-700 font-medium">
                                                {(() => {
                                                  const owner = ownerUsers.find(u => u.id === appt.user_id);
                                                  return owner?.email || appt.user_id;
                                                })()}
                                              </span>
                                            )}
                                          </div>
                                        )}

                                      </div>

                                      {/* Actions column: 3-dot on top, Video Call on bottom */}
                                      <div className="flex flex-col items-center justify-between py-3 px-2 border-l border-gray-100 bg-gray-50/80 rounded-r-2xl min-w-[56px]">
                                        <DropdownMenu>
                                          <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-black/10">
                                              <MoreVertical className="h-4 w-4 text-gray-500" />
                                              <span className="sr-only">Open menu</span>
                                            </Button>
                                          </DropdownMenuTrigger>
                                          <DropdownMenuContent align="end" className="w-48">
                                            {(() => {
                                              const perm = getUserPermission(appt);
                                              return (
                                                <>
                                                  {(perm === "owner" || perm === "full" || perm === "write") && (
                                                    <DropdownMenuItem onClick={() => handleToggleStatus(appt.id, isDone ? "pending" : "done")}>
                                                      {isDone ? (
                                                        <><Circle className="h-4 w-4" /><span>Mark as open</span></>
                                                      ) : (
                                                        <><CheckCircle className="h-4 w-4 text-green-600" /><span className="text-green-600">Mark as done</span></>
                                                      )}
                                                    </DropdownMenuItem>
                                                  )}
                                                  {(perm === "owner" || perm === "full") && (
                                                    <>
                                                      {(perm === "owner" || perm === "full" || perm === "write") && <DropdownMenuSeparator />}
                                                      <DropdownMenuItem onClick={() => handleEdit(appt)}>
                                                        <FiEdit2 className="h-4 w-4" /><span>Edit</span>
                                                      </DropdownMenuItem>
                                                      <DropdownMenuItem onClick={() => handleDelete(appt.id)} className="text-red-600 focus:bg-red-50 focus:text-red-600">
                                                        <FiTrash2 className="h-4 w-4" /><span>Delete</span>
                                                      </DropdownMenuItem>
                                                    </>
                                                  )}
                                                </>
                                              );
                                            })()}
                                          </DropdownMenuContent>
                                        </DropdownMenu>
                                        {/* Video call button only shown for telehealth appointments */}
                                        {appt.is_telehealth && (
                                          <VideoCall
                                            appointmentId={appt.id}
                                            appointmentTitle={appt.title ?? "Video Consultation"}
                                          />
                                        )}
                                      </div>
                                    </motion.div>
                                  );
                                })}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </motion.div>
                  </div>
                );
              })}
            </motion.div>
          )}
          {editAppt ? (
            <AppointmentDialogController
              appointment={editAppt}
              onSuccess={handleEditSuccess}
              isOpen={editOpen}
              onOpenChange={handleEditDialogChange}
            />
          ) : null}
          <ConfirmActionDialog
            open={Boolean(deleteTargetId)}
            onOpenChange={(open) => {
              if (!open) setDeleteTargetId(null);
            }}
            variant="destructive"
            title="Delete appointment?"
            subtitle="This will permanently remove this appointment from your calendar."
            confirmLabel="Delete"
            cancelLabel="Cancel"
            onConfirm={() => {
              if (deleteTargetId) {
                deleteAppointment(deleteTargetId);
              }
              setDeleteTargetId(null);
            }}
          />
        </>
      )}
    </div>
  );
}