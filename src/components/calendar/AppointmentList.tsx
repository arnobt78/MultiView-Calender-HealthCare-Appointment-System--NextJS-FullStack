"use client";

import { useState, useRef, useMemo, type ComponentType } from "react";
import { FullAppointment } from "@/hooks/useAppointments";
import { useAssignees } from "@/hooks/useAssignees";
import { useOwnerUserSummaries } from "@/hooks/useOwnerUserSummaries";
import { useCategories } from "@/hooks/useCategories";
import { usePatients } from "@/hooks/usePatients";
import { useAuth } from "@/hooks/useAuth";
import { useAppointmentData } from "@/context/AppointmentDataContext";
import {
  useCalendarFilters,
  applyCalendarFilters,
} from "@/context/CalendarFiltersContext";
import {
  resolveDayStatsForDate,
  summarizeDayAppointments,
  type DailyAppointmentStats,
} from "@/lib/appointment-stats";
import { AppointmentOpenAlertDoneBadges } from "@/components/shared/appointments/AppointmentOpenAlertDoneBadges";
import { collectAppointmentStaffUserIds } from "@/lib/appointment-card";
import {
  APPOINTMENT_LIST_SECTION_UI,
  bucketDateGroupsByListSection,
  groupRowsByStartDate,
  prioritizeTodayGroup,
  type AppointmentListSectionKey,
} from "@/lib/appointment-list-sections";
import { AppointmentListSectionAccordion } from "@/components/shared/AppointmentListSectionAccordion";
import type { AppointmentAssignee, Patient } from "@/types/types";
import Filters from "./Filters";
import AppointmentDialogController from "./AppointmentDialogController";
import { useDateContext } from "@/context/DateContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CalendarCheck2,
  CalendarClock,
  CalendarX2,
  CalendarDays,
} from "lucide-react";

const LIST_SECTION_ICONS: Record<ListSectionKey, ComponentType<{ className?: string }>> = {
  today: CalendarCheck2,
  tomorrow: CalendarClock,
  passed: CalendarX2,
  later: CalendarDays,
};
import VideoCall from "./VideoCall";
import { AppointmentCard } from "@/components/shared/AppointmentCard";
import { useAppointmentInvoiceDisplayMap } from "@/hooks/useAppointmentInvoiceDisplayMap";
import GlobalCalendarFilters from "./GlobalCalendarFilters";
import { CalendarFiltersEmptyState } from "./CalendarFiltersEmptyState";
import { buildCalendarFiltersEmptyCopy } from "@/lib/calendar-filters-empty-copy";
import { motion } from "framer-motion";
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
  dayStats: DailyAppointmentStats;
}) {
  return (
    <div className="my-2 flex flex-wrap items-center gap-2">
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
      <AppointmentOpenAlertDoneBadges stats={dayStats} />
    </div>
  );
}

type ListSectionKey = AppointmentListSectionKey;

export default function AppointmentList() {
  const { user } = useAuth();

  // Edit Dialog State
  const [editAppt, setEditAppt] = useState<FullAppointment | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { currentDate } = useDateContext();

  // Queries
  const {
    appointments,
    isLoading: loadingAppointments,
    isFetching: fetchingAppointments,
    deleteAppointmentAsync,
    isDeleting,
    cancelAppointmentAsync,
    cancellingAppointmentId,
    toggleStatus,
    refetch: refetchAppointments,
    summaryStats,
    dailyStatsMap,
  } = useAppointmentData();

  const { categories } = useCategories();
  const { patients } = usePatients();
  const {
    category,
    patient,
    date,
    status,
    month,
    search,
    clinicalRole,
    hasActiveFilters,
    resetFilters,
  } = useCalendarFilters();

  const monthOptions = useMemo(() => {
    const all = new Set<string>();
    appointments.forEach((a) => {
      const d = new Date(a.start);
      all.add(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
    });
    return Array.from(all)
      .sort((a, b) => b.localeCompare(a))
      .map((value) => {
        const [year, monthPart] = value.split("-");
        const formatted = new Intl.DateTimeFormat("de-DE", {
          month: "long",
          year: "numeric",
        }).format(new Date(Number(year), Number(monthPart) - 1, 1));
        return { value, label: formatted };
      });
  }, [appointments]);

  const filtersEmptyCopy = useMemo(() => {
    const selectedCategory = category
      ? categories.find((c) => c.id === category)
      : undefined;
    const selectedPatient = patient ? patients.find((p) => p.id === patient) : undefined;
    const monthLabel = month
      ? monthOptions.find((m) => m.value === month)?.label
      : undefined;
    return buildCalendarFiltersEmptyCopy({
      search,
      category,
      patient,
      date,
      status,
      month,
      clinicalRole,
      categoryLabel: selectedCategory?.label,
      patientLabel: selectedPatient
        ? `${selectedPatient.firstname} ${selectedPatient.lastname}`.trim()
        : undefined,
      monthLabel,
      totalAppointments: appointments.length,
    });
  }, [
    search,
    category,
    patient,
    date,
    status,
    month,
    clinicalRole,
    categories,
    patients,
    monthOptions,
    appointments.length,
  ]);
  const { assignees } = useAssignees();
  const ownerUsers = useOwnerUserSummaries(
    collectAppointmentStaffUserIds(appointments),
    user
  );
  const [collapsedSections, setCollapsedSections] = useState<Record<ListSectionKey, boolean>>({
    today: false,
    tomorrow: false,
    passed: true,
    later: false,
  });

  const filteredBySidebar = useMemo(
    () =>
      applyCalendarFilters(
        appointments,
        { category, patient, date, status, month, search: "", clinicalRole },
        patients,
        user?.id
      ),
    [appointments, category, patient, date, status, month, clinicalRole, patients, user?.id]
  );

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

  const invoiceDisplayByAppt = useAppointmentInvoiceDisplayMap(
    filteredAppointments.map((a) => a.id)
  );

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
  const groupedWithTodayFirst = useMemo(
    () => prioritizeTodayGroup(groupRowsByStartDate(filteredAppointments)),
    [filteredAppointments]
  );

  const groupedSections = useMemo(() => {
    const raw = bucketDateGroupsByListSection(groupedWithTodayFirst);
    return {
      today: raw.today.map((g) => ({ date: g.date, appts: g.items })),
      tomorrow: raw.tomorrow.map((g) => ({ date: g.date, appts: g.items })),
      passed: raw.passed.map((g) => ({ date: g.date, appts: g.items })),
      later: raw.later.map((g) => ({ date: g.date, appts: g.items })),
    };
  }, [groupedWithTodayFirst]);

  const sectionConfig = APPOINTMENT_LIST_SECTION_UI;

  const toggleSection = (key: ListSectionKey) => {
    setCollapsedSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };
  return (
    <div className="pt-0 px-2 sm:px-4 lg:px-8 pb-8">
      {/* Sticky top rows: title/badges + filters */}
      <CalendarStickyHeader >
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <h2 className="text-lg font-semibold tracking-tight text-gray-700">
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
          <StatBadge label="Cancelled" value={summaryStats.cancelled} className="calendar-glass-badge-slate" />
        </div>
        <GlobalCalendarFilters categories={categories} patients={patients} />
      </CalendarStickyHeader>

      {/* Data area — skeleton while loading, real content once ready */}
      {loadingAppointments ? (
        <div className="animate-pulse my-2 flex flex-col gap-4">
          <div className="h-6 w-56 bg-gray-200 rounded mb-1" />
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="relative rounded-2xl bg-white border border-gray-100 flex items-stretch min-h-[130px]">
              <div className="w-1.5 rounded-l-2xl h-full absolute left-0 top-0 bottom-0 bg-gray-200" />
              <div className="pl-6 pr-4 py-4 flex-1 flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <div className="h-5 w-36 bg-gray-200 rounded-2xl" />
                  <div className="h-5 w-20 bg-gray-100 rounded-full" />
                </div>
                <div className="flex items-center gap-2">
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
              <div className="flex flex-col items-center justify-center gap-2 min-w-[68px] py-4 px-3 border-l border-gray-100">
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
            <CalendarFiltersEmptyState
              copy={filtersEmptyCopy}
              onReset={resetFilters}
            />
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
                const sectionAppts = groups.flatMap((g) => g.appts);
                const sectionCount = sectionAppts.length;
                const sectionStats = summarizeDayAppointments(sectionAppts);
                const isCollapsed = collapsedSections[section.key];
                const SectionIcon = LIST_SECTION_ICONS[section.key];
                return (
                  <AppointmentListSectionAccordion
                    key={section.key}
                    section={section}
                    icon={<SectionIcon className="h-4.5 w-4.5" />}
                    count={sectionCount}
                    statusStats={sectionCount > 0 ? sectionStats : undefined}
                    collapsed={isCollapsed}
                    onToggle={() => toggleSection(section.key)}
                  >
                    {groups.length === 0 ? (
                      <div className="mt-2 flex items-center gap-2 rounded-2xl border border-dashed border-gray-300/80 bg-gray-50/80 px-3 py-2.5 text-sm text-gray-500">
                        <SectionIcon className="h-4 w-4 text-gray-400" aria-hidden />
                        <span>{section.emptyMessage}</span>
                      </div>
                    ) : (
                      groups.map(({ date, appts }) => (
                        <div key={`${section.key}-${date.toISOString()}`}>
                          <DateHeadline
                            date={date}
                            dayStats={resolveDayStatsForDate({
                              date,
                              filteredDayAppts: appts,
                              dailyStatsMap,
                              preferCached: !hasActiveFilters,
                            })}
                          />
                          <div className="flex flex-col gap-4">
                            {appts.map((appt: FullAppointment, i: number) => {
                              const start = new Date(appt.start);
                              const now = new Date();
                              const isTodayAppt =
                                start.getFullYear() === now.getFullYear() &&
                                start.getMonth() === now.getMonth() &&
                                start.getDate() === now.getDate();

                              return (
                                <motion.div
                                  key={appt.id}
                                  data-today={isTodayAppt ? "true" : undefined}
                                  ref={isTodayAppt && i === 0 ? scrollRef : null}
                                  initial={{ opacity: 0, y: 14 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ duration: 0.32, delay: i * 0.07 }}
                                >
                                  <AppointmentCard
                                    variant="list"
                                    appointment={appt}
                                    patients={patients}
                                    assignees={assignees}
                                    ownerUsers={ownerUsers}
                                    invoiceDisplayStatus={invoiceDisplayByAppt.get(appt.id)}
                                    appointmentTypePriceCents={appt.appointment_type_price_cents}
                                    doctorConsultationFeeCents={appt.doctor_consultation_fee_cents}
                                    onEdit={handleEdit}
                                    onDelete={handleDelete}
                                    onCancel={async (id) => {
                                      await cancelAppointmentAsync(id);
                                    }}
                                    cancelPending={cancellingAppointmentId === appt.id}
                                    onToggleStatus={handleToggleStatus}
                                    telehealthSlot={
                                      appt.is_telehealth ? (
                                        <VideoCall
                                          appointmentId={appt.id}
                                          appointmentTitle={appt.title ?? "Video Consultation"}
                                        />
                                      ) : undefined
                                    }
                                  />
                                </motion.div>
                              );
                            })}
                          </div>
                        </div>
                      ))
                    )}
                  </AppointmentListSectionAccordion>
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
            onConfirm={async () => {
              if (!deleteTargetId) return;
              await deleteAppointmentAsync(deleteTargetId);
              setDeleteTargetId(null);
            }}
            confirmPending={isDeleting}
            confirmPendingLabel="Deleting…"
          />
        </>
      )}
    </div>
  );
}