"use client";

/**
 * PatientPortalPage
 *
 * Redesigned with:
 * - One shadcn Card for sidebar (Profile + Summary + Invoices); Appointment History is its own Card
 * - Full patient data display (avatar/robohash, age, primary doctor, referral,
 *   allergies, clinical notes, invoices) using schema fields
 * - Booking wizard: `PatientBookingDialog` in shared/patient-booking
 * - Pill-style All / Upcoming / Past toggle with icons
 * - Inline skeleton pattern: structural chrome always mounted, only data values pulse
 */

import { useState, useEffect, useLayoutEffect, useMemo, createElement, type ReactNode } from "react";
import { seedInvoicesListCacheFromSsr } from "@/lib/invoices-query-ssr-seed";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { invalidateInvoicesAndOverview } from "@/lib/query-client";
import { usePayments, type Invoice } from "@/hooks/usePayments";
import { PatientPortalInvoiceCard } from "@/components/shared/billing/PatientPortalInvoiceCard";
import { differenceInYears, format, isPast, isFuture, isToday } from "date-fns";
import type { PortalPrefetchData } from "@/lib/server-prefetch";
import { apiClient } from "@/lib/api-client";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { AppointmentListSectionAccordion } from "@/components/shared/AppointmentListSectionAccordion";
import { summarizeDayAppointments } from "@/lib/appointment-stats";
import { PortalAppointmentTimelineCard } from "@/components/shared/PortalAppointmentTimelineCard";
import { useAppointmentColor } from "@/context/AppointmentColorContext";
import {
  appointmentListSectionConfig,
  bucketDateGroupsByListSection,
  groupRowsByStartDate,
  listSectionsForPortalFilter,
  prioritizeTodayGroup,
  type AppointmentListSectionKey,
} from "@/lib/appointment-list-sections";
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  Cake,
  Calendar,
  CalendarCheck,
  CalendarCheck2,
  CalendarClock,
  CalendarDays,
  CalendarX,
  CalendarX2,
  CheckCircle2,
  CreditCard,
  FileText,
  GitBranch,
  Hash,
  History,
  Layers,
  List,
  MapPin,
  Receipt,
  ShieldCheck,
  ShieldOff,
  Stethoscope,
  User,
} from "lucide-react";
import type { Patient, PatientClinicalProfile, User as AppUser } from "@/types/types";
import { EntityTitleLink } from "@/components/shared/EntityTitleLink";
import { DoctorIdentityRow } from "@/components/shared/doctor-display/DoctorIdentityRow";
import { PortalChromeHeader } from "@/components/shared/PortalChromeHeader";
import { appPortalSectionRootClass } from "@/lib/section-page-layout";
import { ProfileDefinitionRow } from "@/components/shared/profile/ProfileDefinitionRow";
import { EntityIdCopyInline } from "@/components/shared/EntityIdCopyInline";
import { BookAppointmentDialog } from "@/components/shared/patient-booking/PatientBookingDialog";
import { useUsers } from "@/hooks/useUsers";
import { queryKeys } from "@/lib/query-keys";
import { AppointmentStatusGlassBadge } from "@/components/shared/appointments/AppointmentStatusGlassBadge";
import { resolveAppointmentStatusMeta } from "@/lib/appointment-status-display";
import { prefetchDoctorsDirectory } from "@/lib/prefetch-doctors-directory";
import { getPatientCareLevelLabel } from "@/lib/patient-care-level";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// APPOINTMENT TIMELINE — dashboard list sections + per-id color palette
// ---------------------------------------------------------------------------

type ApptRow = PortalPrefetchData["appointments"][number];

/** Re-export for pages that import booking dialog from the portal module. */
export { BookAppointmentDialog } from "@/components/shared/patient-booking/PatientBookingDialog";

const PORTAL_LIST_SECTION_ICONS: Record<
  AppointmentListSectionKey,
  React.ComponentType<{ className?: string }>
> = {
  today: CalendarCheck2,
  tomorrow: CalendarClock,
  passed: CalendarX2,
  later: CalendarDays,
};

function PortalTimelineRailItem({ appt }: { appt: ApptRow }) {
  const { getAppointmentColorToken } = useAppointmentColor();
  const lineColor = getAppointmentColorToken(appt.id, null).lineColor;
  const StatusIcon = resolveAppointmentStatusMeta(appt.status).Icon;
  return (
    <div className="relative pl-12">
      <div
        className="absolute left-2 top-4 z-10 flex h-5 w-5 items-center justify-center rounded-full border-2 border-background text-white shadow-sm"
        style={{ backgroundColor: lineColor }}
      >
        {createElement(StatusIcon, { className: "h-3 w-3", "aria-hidden": true })}
      </div>
      <PortalAppointmentTimelineCard appointment={appt} />
    </div>
  );
}

function AppointmentTimeline({
  appointments,
  loading,
}: {
  appointments: ApptRow[];
  loading?: boolean;
}) {
  const [filter, setFilter] = useState<"all" | "upcoming" | "past">("all");
  const [collapsedSections, setCollapsedSections] = useState<
    Record<AppointmentListSectionKey, boolean>
  >({
    today: false,
    tomorrow: false,
    passed: false,
    later: false,
  });

  const filtered = appointments.filter((a) => {
    const d = new Date(a.start);
    if (filter === "upcoming") return isFuture(d) || isToday(d);
    if (filter === "past") return isPast(d) && !isToday(d);
    return true;
  });

  const sectionBuckets = useMemo(() => {
    const grouped = prioritizeTodayGroup(groupRowsByStartDate(filtered));
    return bucketDateGroupsByListSection(grouped);
  }, [filtered]);

  const visibleSectionKeys = listSectionsForPortalFilter(filter);

  const filterTabs: { key: "all" | "upcoming" | "past"; label: string; icon: React.ReactNode }[] = [
    { key: "all", label: "All", icon: <List className="h-3.5 w-3.5" /> },
    { key: "upcoming", label: "Upcoming", icon: <CalendarClock className="h-3.5 w-3.5" /> },
    { key: "past", label: "Past", icon: <History className="h-3.5 w-3.5" /> },
  ];

  return (
    /**
     * Single shadcn `Card` — section title + toolbar + list live inside one `CardContent`
     * so the heading is not visually split from the body (same pattern as sidebar).
     */
    <Card className="rounded-[24px] border border-slate-200/80 bg-card shadow-md overflow-hidden">
      <CardContent className="space-y-4 p-4 text-gray-700">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/70 pb-2">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-sky-800">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-sky-100 border border-sky-200 shrink-0">
              <CalendarDays className="h-3.5 w-3.5 text-sky-600" />
            </span>
            Appointment History
            {!loading && (
              <Badge
                variant="outline"
                className="calendar-glass-badge calendar-glass-badge-sky font-normal ml-1"
              >
                {filtered.length}
              </Badge>
            )}
          </h3>
          <div className="inline-flex bg-muted/60 rounded-full p-1 gap-1 border">
            {filterTabs.map(({ key, label, icon }) => (
              <button
                key={key}
                type="button"
                onClick={() => setFilter(key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-normal transition-all ${filter === key
                  ? "bg-background shadow text-foreground"
                  : "text-muted-foreground hover:text-foreground"
                  }`}
              >
                {icon} {label}
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-4">

          {/* Skeleton while loading */}
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="relative pl-12">
                  <Skeleton className="absolute left-2 top-3 h-5 w-5 rounded-full" />
                  <div className="rounded-xl border p-4 space-y-2">
                    <div className="flex justify-between gap-4">
                      <div className="space-y-1.5 flex-1">
                        <Skeleton className="h-4 w-40 rounded" />
                        <Skeleton className="h-3 w-56 rounded" />
                      </div>
                      <Skeleton className="h-4 w-14 rounded" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : appointments.length === 0 ? (
            /* Empty state */
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Stethoscope className="mb-3 h-10 w-10 text-gray-400" />
              <p className="font-medium text-gray-700">No appointments yet</p>
              <p className="mt-1 text-xs text-gray-600">Your history will appear here once you&apos;ve had appointments.</p>
            </div>
          ) : filtered.length === 0 ? (
            <p className="py-6 text-center text-sm text-gray-700">No {filter} appointments.</p>
          ) : (
            <div className="flex flex-col gap-4">
              {visibleSectionKeys.map((sectionKey) => {
                const section = appointmentListSectionConfig(sectionKey);
                const groups = sectionBuckets[sectionKey];
                const sectionAppts = groups.flatMap((g) => g.items);
                const sectionCount = sectionAppts.length;
                const sectionStats = summarizeDayAppointments(sectionAppts);
                const isCollapsed = collapsedSections[sectionKey];
                const SectionIcon = PORTAL_LIST_SECTION_ICONS[sectionKey];
                return (
                  <AppointmentListSectionAccordion
                    key={sectionKey}
                    section={section}
                    icon={<SectionIcon className="h-4.5 w-4.5" />}
                    count={sectionCount}
                    statusStats={sectionCount > 0 ? sectionStats : undefined}
                    collapsed={isCollapsed}
                    onToggle={() =>
                      setCollapsedSections((prev) => ({
                        ...prev,
                        [sectionKey]: !prev[sectionKey],
                      }))
                    }
                  >
                    {groups.length === 0 ? (
                      <div className="mt-1 flex items-center gap-2 rounded-2xl border border-dashed border-gray-300/80 bg-gray-50/80 px-3 py-2.5 text-sm text-gray-500">
                        <SectionIcon className="h-4 w-4 text-gray-400" aria-hidden />
                        <span>{section.emptyMessage}</span>
                      </div>
                    ) : (
                      <div className="relative space-y-3 before:absolute before:inset-y-0 before:left-[18px] before:w-0.5 before:bg-linear-to-b before:from-sky-300/60 before:via-sky-200/40 before:to-transparent">
                        {groups.flatMap((group) =>
                          group.items.map((appt) => (
                              <PortalTimelineRailItem key={appt.id} appt={appt} />
                            ))
                        )}
                      </div>
                    )}
                  </AppointmentListSectionAccordion>
                );
              })}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// MAIN PAGE
// ---------------------------------------------------------------------------

function renderPrimaryDoctor(patient: Patient, portalDoctors: AppUser[]): ReactNode {
  type LegacyNested = {
    primary_doctor?: { display_name?: string | null; email?: string } | null;
  };
  const pRow = patient as Patient & LegacyNested;
  const nested = pRow.primary_doctor;
  if (pRow.primary_doctor_id && pRow.primary_doctor_display?.trim()) {
    const doc = portalDoctors.find((x) => x.id === pRow.primary_doctor_id);
    const resolvedSpecialty = doc?.specialty ?? pRow.primary_doctor_specialty ?? null;
    const resolvedImage =
      pRow.primary_doctor_image?.trim() || doc?.image?.trim() || null;
    return (
      <DoctorIdentityRow
        doctor={{
          id: pRow.primary_doctor_id,
          display_name: pRow.primary_doctor_display.trim(),
          email: pRow.primary_doctor_email ?? null,
          specialty: resolvedSpecialty,
          image: resolvedImage,
        }}
        size="sm"
        showEmail
        linkKind="role"
      />
    );
  }
  if (nested && (nested.display_name?.trim() || nested.email)) {
    return (
      <>
        {nested.display_name?.trim() || nested.email}
        {nested.email && nested.display_name?.trim() ? (
          <span className="text-gray-600"> ({nested.email.trim()})</span>
        ) : null}
      </>
    );
  }
  return pRow.primary_doctor_display ?? "—";
}

type PatientPortalPageProps = {
  /**
   * Server-prefetched portal data — seeds queryKeys.patientPortal.all so the
   * profile card and timeline render on first paint without a loading flash.
   */
  initialPortalData?: PortalPrefetchData | null;
  /** SSR seed for chart-linked invoices (queryKeys.invoices.all). */
  initialInvoices?: Invoice[];
  /** Stripe checkout return — parsed on server from ?status= (no useSearchParams). */
  paymentReturnStatus?: "success" | "cancelled" | null;
};

export default function PatientPortalPage({
  initialPortalData,
  initialInvoices = [],
  paymentReturnStatus = null,
}: PatientPortalPageProps = {}) {
  const queryClient = useQueryClient();
  const router = useRouter();
  useMemo(() => {
    seedInvoicesListCacheFromSsr(queryClient, initialInvoices);
    return null;
  }, [queryClient, initialInvoices]);

  const {
    invoices: invoicesList,
    isLoading: invoicesLoading,
    isError: invoicesError,
    pay,
    isPaying,
  } = usePayments({ invoicesInitialData: initialInvoices });

  // Seed cache synchronously before first paint to avoid skeleton flash
  useLayoutEffect(() => {
    if (initialPortalData != null) {
      queryClient.setQueryData(queryKeys.patientPortal.all, initialPortalData);
    }
    // Warm doctor directory for booking step 1 cards (availabilities + service labels).
    prefetchDoctorsDirectory(queryClient);
    // SSR invoice list — always seed (including []) so client matches server without isMounted gate.
    seedInvoicesListCacheFromSsr(queryClient, initialInvoices);
  }, [queryClient, initialPortalData, initialInvoices]);

  /** Stripe return — bust invoice cache without full page reload. */
  useEffect(() => {
    if (paymentReturnStatus !== "success" && paymentReturnStatus !== "cancelled") return;
    void invalidateInvoicesAndOverview(queryClient);
    router.replace("/patient-portal", { scroll: false });
  }, [paymentReturnStatus, queryClient, router]);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: queryKeys.patientPortal.all,
    queryFn: () => apiClient<PortalPrefetchData>("/api/patient-portal"),
    initialData: initialPortalData ?? undefined,
    // SSR seed + initialData keeps profile chrome stable; 30 s window avoids redundant refetch.
    staleTime: 30_000,
  });

  const { data: portalDoctorsData, isLoading: portalDoctorsLoading } = useUsers({
    role: "doctor",
    limit: 200,
  });
  const portalDoctors = portalDoctorsData?.users ?? [];

  const patient = data?.patient ?? null;
  const portalLoading = isLoading && !data;
  const profileLoading = isLoading && !patient;
  const userImage = data?.userImage ?? null;
  const appointments = data?.appointments ?? [];

  const done = appointments.filter((a) => a.status === "done").length;
  const upcoming = appointments.filter((a) => isFuture(new Date(a.start)) || isToday(new Date(a.start))).length;
  const total = appointments.length;

  // Derive age from birth_date
  const age = patient?.birth_date
    ? differenceInYears(new Date(), new Date(patient.birth_date))
    : null;

  /**
   * Avatar URL resolution for `UserAvatar` / `SafeImage` (same stack as PatientDetailScreen):
   * - Treat empty strings like missing (DB sometimes stores "" for image).
   * - `UserAvatar` applies `referrerPolicy="no-referrer"` for OAuth CDN images.
   * - Robohash PNG fallback; prefetch includes `userImage` — see `prefetchPortalData`.
   */
  const clinicalImageUrl = (patient?.clinical_profile as PatientClinicalProfile & { image_url?: string })?.image_url;
  const trimmedOAuth = userImage?.trim() ? userImage : null;
  const trimmedClinical = clinicalImageUrl?.trim() ? clinicalImageUrl : null;
  const robohashFallback =
    patient != null
      ? `https://robohash.org/${encodeURIComponent(patient.email || patient.id)}.png?set=set4&size=128x128`
      : undefined;
  const avatarSrc = trimmedOAuth ?? trimmedClinical ?? robohashFallback;

  const clinicalProfile = patient?.clinical_profile as PatientClinicalProfile;
  const invoices = invoicesList ?? [];
  /**
   * Keep Primary Doctor row in doctorStack skeleton state until doctor directory metadata
   * is available; prevents specialty-badge pop-in from expanding the row after first paint.
   */
  const primaryDoctorRowLoading = profileLoading;

  if (isError) {
    return (
      <div className="py-8">
        <p className="text-red-500">Error: {(error as Error)?.message}</p>
      </div>
    );
  }

  return (
    <div className={appPortalSectionRootClass}>
      <PortalChromeHeader
        icon={Activity}
        title="Patient Portal"
        description="View your appointment history and request new appointments"
        actions={<BookAppointmentDialog />}
      />

      <div className="grid md:grid-cols-3 gap-4">
        {/* Left sidebar: one shadcn Card — section titles sit inside the same CardContent
            as their body (no separate tinted CardHeader strip above the white panel). */}
        <div>
          <Card className="rounded-[24px] border border-slate-200/80 bg-card shadow-[0_8px_32px_rgba(99,102,241,0.12)] overflow-hidden">
            <CardContent className="space-y-6 p-4 text-gray-700">
              {/* ── My Profile ───────────────────────────────── */}
              <section aria-labelledby="pp-profile-heading">
                <h3
                  id="pp-profile-heading"
                  className="text-sm font-semibold flex items-center gap-2 text-sky-800 mb-3"
                >
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-sky-100 border border-sky-200 shrink-0">
                    <User className="h-3.5 w-3.5 text-sky-600" />
                  </span>
                  My Profile
                </h3>
                <div className="space-y-3">
                  {profileLoading || patient ? (
                    <>
                      <div className="flex items-start gap-2">
                        {profileLoading && !patient ? (
                          <Skeleton className="h-16 w-16 shrink-0 rounded-full" />
                        ) : patient ? (
                          <UserAvatar
                            src={avatarSrc}
                            fallbackText={`${patient.firstname?.[0] ?? "?"}${patient.lastname?.[0] ?? "?"}`}
                            sizeClassName="h-16 w-16"
                            loading={false}
                          />
                        ) : null}
                        <div className="min-w-0 flex-1">
                          {profileLoading ? (
                            <div className="space-y-2">
                              <Skeleton className="h-4 w-28 rounded" />
                              <Skeleton className="h-3 w-36 rounded" />
                              <div className="mt-1.5 flex flex-wrap gap-1.5">
                                <Skeleton className="h-5 w-14 rounded-full" />
                                <Skeleton className="h-5 w-16 rounded-full" />
                              </div>
                            </div>
                          ) : patient ? (
                            <>
                              <p className="truncate text-sm font-bold leading-tight text-gray-700">
                                {patient.firstname} {patient.lastname}
                              </p>
                              {patient.email ? (
                                <p className="truncate text-xs text-gray-600">{patient.email}</p>
                              ) : null}
                              {patient.pronoun ? (
                                <p className="text-xs text-gray-600">{patient.pronoun}</p>
                              ) : null}
                              <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                                {patient.active ? (
                                  <Badge
                                    variant="outline"
                                    className="calendar-glass-badge calendar-glass-badge-emerald gap-1 py-0 text-[10px]"
                                  >
                                    <ShieldCheck className="h-2.5 w-2.5" /> Active
                                  </Badge>
                                ) : (
                                  <Badge
                                    variant="outline"
                                    className="calendar-glass-badge calendar-glass-badge-slate gap-1 py-0 text-[10px]"
                                  >
                                    <ShieldOff className="h-2.5 w-2.5" /> Inactive
                                  </Badge>
                                )}
                                {age !== null ? (
                                  <Badge
                                    variant="outline"
                                    className="calendar-glass-badge calendar-glass-badge-sky gap-1 py-0 text-[10px]"
                                  >
                                    <Cake className="h-2.5 w-2.5" /> Age {age}
                                  </Badge>
                                ) : null}
                              </div>
                            </>
                          ) : null}
                        </div>
                      </div>

                      <Separator />

                      <dl className="space-y-2.5 text-xs">
                        <ProfileDefinitionRow
                          icon={Hash}
                          iconClassName="bg-muted/60"
                          label="Patient ID"
                          variant="mono"
                          loading={profileLoading}
                        >
                          {patient?.id ? <EntityIdCopyInline value={patient.id} /> : "—"}
                        </ProfileDefinitionRow>

                        <ProfileDefinitionRow
                          icon={Cake}
                          iconClassName="border-orange-100 bg-orange-50 [&_svg]:text-orange-500"
                          label="Birth Date"
                          loading={profileLoading}
                        >
                          {patient?.birth_date
                            ? format(new Date(patient.birth_date), "dd MMM yyyy")
                            : "—"}
                        </ProfileDefinitionRow>

                        <ProfileDefinitionRow
                          icon={Layers}
                          iconClassName="border-violet-100 bg-violet-50 [&_svg]:text-violet-500"
                          label="Care Tier (1–10)"
                          loading={profileLoading}
                        >
                          {patient?.care_level != null
                            ? getPatientCareLevelLabel(patient.care_level)
                            : "—"}
                        </ProfileDefinitionRow>

                        <ProfileDefinitionRow
                          icon={Stethoscope}
                          iconClassName="border-sky-100 bg-sky-50 [&_svg]:text-sky-500"
                          label="Primary Doctor"
                          variant="doctorStack"
                          loading={primaryDoctorRowLoading}
                        >
                          {patient ? renderPrimaryDoctor(patient, portalDoctors) : "—"}
                        </ProfileDefinitionRow>

                        <ProfileDefinitionRow
                          icon={GitBranch}
                          iconClassName="border-teal-100 bg-teal-50 [&_svg]:text-teal-500"
                          label="Referral"
                          loading={profileLoading}
                        >
                          {clinicalProfile?.referral_source
                            ? `${clinicalProfile.referral_source}${clinicalProfile.referral_detail ? ` — ${clinicalProfile.referral_detail}` : ""}`
                            : "—"}
                        </ProfileDefinitionRow>

                        <ProfileDefinitionRow
                          icon={AlertTriangle}
                          iconClassName="border-amber-100 bg-amber-50 [&_svg]:text-amber-500"
                          label="Allergies"
                          loading={profileLoading}
                        >
                          {clinicalProfile?.allergies?.length
                            ? clinicalProfile.allergies.join(", ")
                            : "—"}
                        </ProfileDefinitionRow>

                        <ProfileDefinitionRow
                          icon={FileText}
                          iconClassName="border-slate-200 bg-slate-50 [&_svg]:text-slate-500"
                          label="Clinical Notes"
                          variant="multiline"
                          loading={profileLoading}
                        >
                          {clinicalProfile?.notes ?? "—"}
                        </ProfileDefinitionRow>
                      </dl>
                    </>
                  ) : (
                    /* No patient record */
                    <div className="py-6 text-center">
                      <User className="mx-auto mb-2 h-10 w-10 text-gray-400" />
                      <p className="text-sm text-gray-700">No patient record linked to your account.</p>
                    </div>
                  )}
                </div>
              </section>

              <Separator />

              {/* ── Summary ───────────────────────────────────── */}
              <section aria-labelledby="pp-summary-heading">
                <h3
                  id="pp-summary-heading"
                  className="text-sm font-semibold flex items-center gap-2 text-emerald-800 mb-3"
                >
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 border border-emerald-200 shrink-0">
                    <Activity className="h-3.5 w-3.5 text-emerald-600" />
                  </span>
                  Summary
                </h3>
                <div className="space-y-3">
                  {(
                    [
                      {
                        label: "Total Appointments",
                        value: total,
                        icon: <CalendarDays className="h-4 w-4 text-sky-500" />,
                        glassCls: "calendar-glass-badge-sky",
                      },
                      {
                        label: "Completed",
                        value: done,
                        icon: <CheckCircle2 className="h-4 w-4 text-emerald-500" />,
                        glassCls: "calendar-glass-badge-emerald",
                      },
                      {
                        label: "Upcoming",
                        value: upcoming,
                        icon: <CalendarClock className="h-4 w-4 text-blue-500" />,
                        glassCls: "calendar-glass-badge-blue",
                      },
                    ] as const
                  ).map(({ label, value, icon, glassCls }) => (
                    <div key={label} className="flex items-center justify-between gap-2">
                      <span className="flex items-center gap-2 text-sm text-gray-700">
                        {icon}
                        {label}
                      </span>
                      {portalLoading ? (
                        <Skeleton className="h-5 w-10 rounded-full" />
                      ) : (
                        <Badge
                          variant="outline"
                          className={cn("calendar-glass-badge font-normal text-sm", glassCls)}
                        >
                          {value}
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </section>

              <Separator />

              {/* ── Invoices ──────────────────────────────────── */}
              <section aria-labelledby="pp-invoices-heading">
                <h3
                  id="pp-invoices-heading"
                  className="text-sm font-semibold flex items-center gap-2 text-amber-800 mb-3 flex-wrap"
                >
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-100 border border-amber-200 shrink-0">
                    <Receipt className="h-3.5 w-3.5 text-amber-600" />
                  </span>
                  Invoices
                  {!invoicesLoading && invoices.length > 0 && (
                    <Badge
                      variant="outline"
                      className="calendar-glass-badge calendar-glass-badge-amber font-normal ml-1"
                    >
                      {invoices.length}
                    </Badge>
                  )}
                </h3>
                <div>
                  {invoicesLoading ? (
                    <div className="space-y-2">
                      {Array.from({ length: 2 }).map((_, i) => (
                        <Skeleton key={i} className="h-28 w-full rounded-xl" />
                      ))}
                    </div>
                  ) : invoicesError ? (
                    <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700 flex items-center gap-2">
                      <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                      Failed to load invoices. Please refresh.
                    </div>
                  ) : invoices.length === 0 ? (
                    <div className="py-4 text-center">
                      <CreditCard className="mx-auto mb-2 h-8 w-8 text-gray-400" />
                      <p className="text-xs text-gray-700">No invoices on file.</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {invoices.map((inv) => (
                        <PatientPortalInvoiceCard
                          key={inv.id}
                          invoice={inv}
                          onPay={() => pay(inv.id)}
                          isPaying={isPaying}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </section>
            </CardContent>
          </Card>
        </div>

        {/* Appointment History — spans 2 columns */}
        <div className="md:col-span-2">
          <AppointmentTimeline appointments={appointments} loading={portalLoading} />
        </div>
      </div>
    </div>
  );
}
