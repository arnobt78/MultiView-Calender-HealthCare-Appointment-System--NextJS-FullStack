"use client";

/**
 * AdminPortalPage — client-side portal for authenticated admins.
 *
 * Sections:
 *   1. Global Overview — KPI cards (appointments, patients, doctors, revenue, pending, overdue)
 *   2. Doctor Directory — summary cards with specialty, patient count, office location
 *   3. Recent Appointments — last 15 appointments across all users
 *
 * Cache seeding: useLayoutEffect sets queryKeys.adminPortal.all from SSR initialData
 * before first paint so KPI cards render immediately with no loading flash.
 *
 * Stale data: `invalidateAdminPortal` (see `src/lib/query-client.ts`) runs after appointment CRUD,
 * assignee/activity edits, entity mutations, and doctor visit-type toggles so this page refetches in place.
 *
 * Date strings: `parseISO` / `format` come from `date-fns` v4, which ships its own TypeScript types
 * (do not install the legacy `@types/date-fns` package alongside v4 — it shadows real exports and causes TS2305).
 */

import { useLayoutEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { format, parseISO } from "date-fns";
import { queryKeys } from "@/lib/query-keys";
import { apiClient } from "@/lib/api-client";
import type { AdminPortalData, Appointment, DoctorRow } from "@/types/types";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { PortalPageChrome } from "@/components/shared/PortalPageChrome";
import { PatientStatCard } from "@/components/control-panel/PatientStatCard";
import { appPortalSectionRootClass } from "@/lib/section-page-layout";
import { portalPanelSectionHeadingClass } from "@/lib/page-chrome-classes";
import { skyGlassTableFrameClass } from "@/lib/calendar-header-action-styles";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { EntityTitleLink } from "@/components/shared/EntityTitleLink";
import { appointmentDetailHref, doctorDetailHref } from "@/lib/entity-routes";
import { DoctorSpecialtyBadge } from "@/components/shared/doctor-display/DoctorSpecialtyBadge";
import { AppointmentStatusGlassBadge } from "@/components/shared/appointments/AppointmentStatusGlassBadge";
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  BadgeDollarSign,
  Calendar,
  CalendarCheck,
  CalendarClock,
  Clock,
  CreditCard,
  MapPin,
  Stethoscope,
  Users,
  Video,
} from "lucide-react";
import { AppointmentListVisitFeeBadge } from "@/components/shared/appointment-display/AppointmentListVisitFeeBadge";
import { AppointmentTypeGlassBadge } from "@/components/shared/appointment-display/AppointmentTypeGlassBadge";
import {
  formatAppointmentTypeDurationLabel,
  resolveAppointmentTypeDisplayName,
  resolveAppointmentTypeDurationMinutes,
} from "@/lib/appointment-type-display";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Format cents as currency string (USD) */
function formatCents(cents: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100);
}

// ---------------------------------------------------------------------------
// Appointment row (recent)
// ---------------------------------------------------------------------------

function RecentAppointmentRow({ appt }: { appt: Appointment & { patient_name?: string | null; owner_display?: string | null } }) {
  const start = parseISO(appt.start);
  const typeName = resolveAppointmentTypeDisplayName(appt);
  const typeDurationLabel = formatAppointmentTypeDurationLabel(
    resolveAppointmentTypeDurationMinutes(appt)
  );

  return (
    <div className="flex items-start gap-2 py-3 border-b border-border/40 last:border-0">
      <div className="flex-shrink-0 w-20 text-right">
        <p className="text-[10px] text-muted-foreground">{format(start, "MMM d")}</p>
        <p className="text-xs font-semibold">{format(start, "HH:mm")}</p>
      </div>
      <div className=" flex-shrink-0 h-2 w-2 rounded-full bg-primary/60" />
      <div className="flex-1 min-w-0">
        <EntityTitleLink
          href={appointmentDetailHref("admin", appt.id)}
          label={appt.title}
          className="text-sm font-medium block truncate"
        />
        {typeName ? (
          <div className="mt-0.5 flex flex-wrap items-center gap-1">
            <AppointmentTypeGlassBadge
              name={typeName}
              durationLabel={typeDurationLabel}
              className="shrink-0"
            />
          </div>
        ) : null}
        <div className="flex items-center gap-2 flex-wrap ">
          {(appt as { patient_name?: string | null }).patient_name && (
            <span className="text-[11px] text-muted-foreground">
              Patient: {(appt as { patient_name?: string | null }).patient_name}
            </span>
          )}
          {(appt as { owner_display?: string | null }).owner_display && (
            <span className="text-[11px] text-muted-foreground">
              · Dr. {(appt as { owner_display?: string | null }).owner_display}
            </span>
          )}
        </div>
      </div>
      <div className="flex flex-col items-end gap-1 flex-shrink-0">
        <AppointmentStatusGlassBadge status={appt.status} size="compact" />
        {appt.is_telehealth && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-normal bg-sky-100/80 text-sky-700 border border-sky-200/60">
            <Video className="h-3 w-3" />
            Telehealth
          </span>
        )}
        <AppointmentListVisitFeeBadge
          appointmentTypePriceCents={appt.appointment_type_price_cents}
          doctorConsultationFeeCents={appt.doctor_consultation_fee_cents}
        />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Doctor summary card
// ---------------------------------------------------------------------------

function DoctorSummaryCard({ doctor }: { doctor: DoctorRow }) {
  return (
    <div className={cn("flex flex-col gap-2 rounded-2xl border border-sky-200/55 bg-white/90 p-4 shadow-[0_14px_48px_-12px_rgba(14,165,233,0.2)]")}>
      <div className="flex items-center gap-2">
        <UserAvatar
          src={doctor.image}
          alt={doctor.display_name ?? doctor.email}
          fallbackText={(doctor.display_name ?? doctor.email).slice(0, 2)}
          sizeClassName="h-10 w-10"
          className="flex-shrink-0"
        />
        <div className="min-w-0">
          <EntityTitleLink
            href={doctorDetailHref("admin", doctor.id)}
            label={doctor.display_name ?? doctor.email}
            className="text-sm font-semibold block truncate"
          />
          {doctor.specialty && (
            <DoctorSpecialtyBadge specialty={doctor.specialty} className="" />
          )}
        </div>
        <Badge variant="secondary" className="ml-auto text-[10px] flex-shrink-0">
          {doctor.patient_count} pts
        </Badge>
      </div>

      <div className="flex flex-wrap gap-2 text-[10px] text-muted-foreground">
        {doctor.office_location && (
          <span className="flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            {doctor.office_location}
          </span>
        )}
        {doctor.consultation_fee != null && (
          <span className="flex items-center gap-1">
            <CreditCard className="h-3 w-3" />
            {formatCents(doctor.consultation_fee)}
          </span>
        )}
        {doctor.years_of_experience != null && (
          <span>{doctor.years_of_experience}y exp</span>
        )}
      </div>

      {doctor.appointment_types.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {doctor.appointment_types.slice(0, 3).map((t) => (
            <span key={t.id} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-normal bg-primary/5 text-primary border border-primary/10">
              {t.is_telehealth && <Video className="h-2.5 w-2.5" />}
              {t.name}
            </span>
          ))}
          {doctor.appointment_types.length > 3 && (
            <span className="text-[10px] text-muted-foreground self-center">
              +{doctor.appointment_types.length - 3}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

interface AdminPortalPageProps {
  initialData: AdminPortalData | null;
}

export default function AdminPortalPage({ initialData }: AdminPortalPageProps) {
  const queryClient = useQueryClient();

  /** Seed the admin-portal cache synchronously before first paint. */
  useLayoutEffect(() => {
    if (initialData != null) {
      queryClient.setQueryData(queryKeys.adminPortal.all, initialData);
    }
  }, [queryClient, initialData]);

  const { data, isLoading } = useQuery<AdminPortalData>({
    queryKey: queryKeys.adminPortal.all,
    queryFn: () => apiClient<AdminPortalData>("/api/admin-portal"),
    staleTime: 3 * 60 * 1000,
    initialData: initialData ?? undefined,
  });

  const hasCache = initialData != null || data != null;
  const kpiLoading = isLoading && !hasCache;

  const overview = data?.overview;
  const doctors = data?.doctors ?? [];
  const recent = data?.recentAppointments ?? [];

  return (
    <div className={cn(appPortalSectionRootClass, "max-w-9xl mx-auto")}>
      <PortalPageChrome
        route="admin_portal"
        description={`Clinic-wide overview · ${format(new Date(), "EEEE, MMMM d yyyy")}`}
      />

      <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
        <PatientStatCard variant="sky" icon={Calendar} title="Total Appointments" subtitle="All-time scheduled visits" value={overview?.totalAppointments ?? 0} valueSkeleton={kpiLoading} />
        <PatientStatCard variant="violet" icon={CalendarClock} title="Today" subtitle="Appointments scheduled today" value={overview?.todayAppointments ?? 0} valueSkeleton={kpiLoading} />
        <PatientStatCard variant="emerald" icon={Users} title="Total Patients" subtitle="Registered patient records" value={overview?.totalPatients ?? 0} valueSkeleton={kpiLoading} />
        <PatientStatCard variant="violet" icon={Stethoscope} title="Total Doctors" subtitle="Active doctor profiles" value={overview?.totalDoctors ?? 0} valueSkeleton={kpiLoading} />
      </div>

      <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
        <PatientStatCard variant="amber" icon={Clock} title="Pending" subtitle="Awaiting completion" value={overview?.pendingAppointments ?? 0} valueSkeleton={kpiLoading} />
        <PatientStatCard variant="rose" icon={AlertTriangle} title="Overdue" subtitle="Past due appointments" value={overview?.overdueAppointments ?? 0} valueSkeleton={kpiLoading} />
        <PatientStatCard
          variant="emerald"
          icon={BadgeDollarSign}
          title="Revenue Collected"
          subtitle="Paid invoice total"
          value={overview?.paidRevenueCents ?? 0}
          valueDisplay={formatCents(overview?.paidRevenueCents ?? 0)}
          valueSkeleton={kpiLoading}
        />
        <PatientStatCard
          variant="amber"
          icon={AlertCircle}
          title="Outstanding"
          subtitle="Unpaid invoice balance"
          value={overview?.outstandingRevenueCents ?? 0}
          valueDisplay={formatCents(overview?.outstandingRevenueCents ?? 0)}
          valueSkeleton={kpiLoading}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className={cn("overflow-hidden p-4", skyGlassTableFrameClass)}>
          <div className={portalPanelSectionHeadingClass}>
            <Activity className="h-4 w-4 text-sky-600" aria-hidden />
            Recent Appointments
            {!kpiLoading ? (
              <Badge variant="secondary" className="text-xs">{recent.length}</Badge>
            ) : null}
          </div>
          <div className="px-1 pb-2">
            {kpiLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex gap-2 py-3">
                    <Skeleton className="h-10 w-20 rounded" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-3 w-2/3" />
                    </div>
                  </div>
                ))}
              </div>
            ) : recent.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <CalendarCheck className="h-8 w-8 mb-2 text-emerald-400" />
                <p className="text-sm">No appointments yet</p>
              </div>
            ) : (
              <div>
                {recent.map((appt) => (
                  <RecentAppointmentRow key={appt.id} appt={appt as Appointment & { patient_name?: string | null; owner_display?: string | null }} />
                ))}
              </div>
            )}
          </div>
        </div>

        <div className={cn("overflow-hidden p-4", skyGlassTableFrameClass)}>
          <div className={portalPanelSectionHeadingClass}>
            <Stethoscope className="h-4 w-4 text-violet-600" aria-hidden />
            Doctor Directory
            {!kpiLoading ? (
              <Badge variant="secondary" className="text-xs">{doctors.length}</Badge>
            ) : null}
          </div>
          <div>
            {kpiLoading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-28 w-full rounded-2xl" />)}
              </div>
            ) : doctors.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
                <Stethoscope className="h-8 w-8 mb-2 opacity-40" />
                <p className="text-sm">No doctors registered</p>
              </div>
            ) : (
              <div className="max-h-[500px] space-y-3 overflow-y-auto pr-1">
                {doctors.map((d) => <DoctorSummaryCard key={d.id} doctor={d} />)}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
