"use client";

/**
 * /services — Doctors & Appointment Types directory
 *
 * Two sections:
 *  1. Our Doctors — cards with photo, specialty, bio, availability days, patient count
 *     and a "Book with this doctor" button (opens the booking wizard pre-selected)
 *  2. Appointment Services — merged catalog (`queryKeys.appointmentTypes.catalog`): globals + deduped additional types
 *
 * Accepts optional `initialDoctors` / `initialServiceCatalog` from the server page for SSR cache seeding
 * (no loading flash on first paint — static text/icons stay visible while only dynamic data pulses).
 */

import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useLayoutEffect } from "react";
import { CopyToClipboardIconButton } from "@/components/shared/CopyToClipboardIconButton";
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";
import {
  Activity,
  CalendarClock,
  CalendarPlus,
  Clock,
  Stethoscope,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { queryKeys } from "@/lib/query-keys";
import { apiClient } from "@/lib/api-client";
import {
  SERVICES_CATALOG_FILTER_ALL,
  defaultServicesCatalogFilter,
  filterServiceCatalog,
  type ServiceCatalogRow,
} from "@/lib/appointment-service-catalog";
import type { DoctorBookableTypeRow } from "@/lib/doctor-bookable-types";
import { filterDoctorsByServiceCatalog } from "@/lib/services-doctor-catalog-filter";
import { useAppointmentServiceCatalog } from "@/hooks/useAppointmentServiceCatalog";
import { ServiceCatalogCard } from "@/components/services/ServiceCatalogCard";
import { PatientBookingDialog } from "@/components/shared/patient-booking/PatientBookingDialog";
import { prefetchAppointmentTypesForDoctor } from "@/lib/prefetch-appointment-types";
import { prefetchDoctorsDirectory } from "@/lib/prefetch-doctors-directory";
import { RoleEntityLink } from "@/components/shared/RoleEntityLink";
import { DoctorSpecialtyBadge } from "@/components/shared/doctor-display/DoctorSpecialtyBadge";
import { EntityActiveStatusBadge } from "@/components/shared/entity-display/EntityActiveStatusBadge";
import { DoctorCardHeroImage } from "@/components/shared/doctor-display/DoctorCardHeroImage";
import { DoctorAvailabilityGroups } from "@/components/shared/doctor-display/DoctorAvailabilityGroups";
import { PortalPageChrome } from "@/components/shared/PortalPageChrome";
import { AppSectionErrorBanner } from "@/components/shared/AppSectionErrorBanner";
import { appPortalSectionRootClass } from "@/lib/section-page-layout";
import { isDoctorActive } from "@/lib/entity-active-status";
import { DoctorProfileCardSkeleton } from "@/components/shared/services/DoctorProfileCardSkeleton";
import {
  ServicesDoctorFilters,
  defaultServicesDoctorFilters,
  type ServicesDoctorFilterState,
} from "@/components/services/ServicesDoctorFilters";
import { ServicesServiceFilters } from "@/components/services/ServicesServiceFilters";
import { VisitFeeInfoNoteCard } from "@/components/shared/billing/VisitFeeInfoNoteCard";
import { buildServicesVisitFeePolicyNote } from "@/lib/appointment-visit-fee-display";

interface DoctorAvailability {
  weekday: number;
  start_min: number;
  end_min: number;
  timezone: string;
}

export interface DoctorCard {
  id: string;
  email: string;
  display_name: string | null;
  image: string | null;
  specialty: string | null;
  bio: string | null;
  created_at: string;
  availabilities: DoctorAvailability[];
  appointment_types: { id: string; name: string; description: string | null; duration_minutes: number }[];
  /** Merged owned + enabled globals — used for visit-type filter on this page. */
  bookable_appointment_types?: DoctorBookableTypeRow[];
  patient_count: number;
  /** Default visit fee when type has no price (cents) — from `GET /api/doctors`. */
  consultation_fee?: number | null;
  /** Doctor account active — inactive doctors stay listed but cannot be booked. */
  is_active?: boolean;
}

/** Copy email with brief check icon feedback — shared clipboard hook. */
function DoctorEmailRow({ email }: { email: string }) {
  const { copied, copy } = useCopyToClipboard();

  return (
    <div className="flex items-center gap-1 min-w-0">
      <p className="text-xs text-muted-foreground truncate">{email}</p>
      <CopyToClipboardIconButton
        copied={copied}
        onCopy={() => void copy(email)}
        label="Copy email"
      />
    </div>
  );
}

/** Single doctor card — hover prefetches visit types for instant booking step 1. */
function DoctorProfileCard({ doctor }: { doctor: DoctorCard }) {
  const queryClient = useQueryClient();
  const name = doctor.display_name ?? doctor.email;
  const doctorActive = isDoctorActive(doctor);

  const warmBookingTypes = () => {
    if (!doctorActive) return;
    prefetchDoctorsDirectory(queryClient);
    prefetchAppointmentTypesForDoctor(queryClient, doctor.id);
  };

  return (
    <Card
      className="rounded-[20px] border-0 bg-card shadow-[0_4px_24px_rgba(2,132,199,0.09)] hover:shadow-[0_8px_32px_rgba(2,132,199,0.18)] transition-all duration-300 overflow-hidden flex flex-col p-0 gap-0"
      onMouseEnter={warmBookingTypes}
      onFocus={warmBookingTypes}
    >
      <DoctorCardHeroImage doctor={doctor} />

      <CardContent className="p-4 flex flex-col gap-2 flex-1">
        <div className="flex flex-col gap-1">
          <RoleEntityLink
            kind="doctor"
            id={doctor.id}
            label={name}
            className="font-semibold text-sm leading-tight block truncate"
          />
          <DoctorEmailRow email={doctor.email} />
          <div className="flex flex-wrap items-center gap-2">
            <DoctorSpecialtyBadge specialty={doctor.specialty} className="self-start" />
            <EntityActiveStatusBadge active={doctorActive} />
          </div>
        </div>

        {doctor.bio && (
          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">{doctor.bio}</p>
        )}

        <div className="space-y-2">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1">
            <CalendarClock className="h-3.5 w-3.5 shrink-0" /> Availability
          </p>
          <DoctorAvailabilityGroups availabilities={doctor.availabilities} layout="services-card" />
        </div>

        {/* `appointment_types` = bookable visit types (Initial Consultation, etc.), not specialty */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground" aria-label="Appointment types offered">
          <span className="flex items-center gap-1">
            <Users className="h-3.5 w-3.5" />
            {doctor.patient_count} patient{doctor.patient_count !== 1 ? "s" : ""}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {(doctor.bookable_appointment_types?.length ?? doctor.appointment_types.length)} type
            {(doctor.bookable_appointment_types?.length ?? doctor.appointment_types.length) !== 1
              ? "s"
              : ""}
          </span>
        </div>

        <div className="flex-1" />

        {doctorActive ? (
          <PatientBookingDialog
            preselectedDoctorId={doctor.id}
            lockDoctor
            trigger={
              <Button size="sm" className="w-full gap-2 bg-sky-600 hover:bg-sky-700 text-white shadow-[0_0_16px_rgba(2,132,199,0.3)] hover:shadow-[0_0_24px_rgba(2,132,199,0.5)] transition-all">
                <CalendarPlus className="h-3.5 w-3.5" />
                Book with Dr. {doctor.display_name?.split(" ")[0] ?? "this doctor"}
              </Button>
            }
          />
        ) : (
          <p className="text-center text-xs text-muted-foreground py-2">
            Inactive — booking unavailable
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function filterDoctors(
  doctors: DoctorCard[],
  filters: ServicesDoctorFilterState,
  catalog: ServiceCatalogRow[]
): DoctorCard[] {
  const q = filters.search.trim().toLowerCase();
  const byService = filterDoctorsByServiceCatalog(doctors, filters.serviceSelection, catalog);
  return byService.filter((d) => {
    if (filters.specialty && d.specialty !== filters.specialty) return false;
    if (filters.weekday != null) {
      const hasDay = d.availabilities.some((a) => a.weekday === filters.weekday);
      if (!hasDay) return false;
    }
    if (!q) return true;
    const blob = [d.display_name, d.email, d.specialty, d.bio].filter(Boolean).join(" ").toLowerCase();
    return blob.includes(q);
  });
}

interface ServicesPageProps {
  initialDoctors?: unknown[];
  initialServiceCatalog?: ServiceCatalogRow[];
}

export default function ServicesPage({ initialDoctors, initialServiceCatalog }: ServicesPageProps) {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<ServicesDoctorFilterState>(defaultServicesDoctorFilters);
  const [catalogFilters, setCatalogFilters] = useState(defaultServicesCatalogFilter);

  useLayoutEffect(() => {
    if (initialDoctors?.length) {
      queryClient.setQueryData(queryKeys.doctors.all, { doctors: initialDoctors as DoctorCard[] });
    }
    if (initialServiceCatalog?.length) {
      queryClient.setQueryData(queryKeys.appointmentTypes.catalog, {
        services: initialServiceCatalog,
      });
    }
  }, [queryClient, initialDoctors, initialServiceCatalog]);

  const { data: doctorsData, isLoading: doctorsLoading, isError: doctorsError } = useQuery({
    queryKey: queryKeys.doctors.all,
    queryFn: () => apiClient<{ doctors: DoctorCard[] }>("/api/doctors"),
    initialData: initialDoctors?.length
      ? { doctors: initialDoctors as DoctorCard[] }
      : undefined,
    staleTime: 5 * 60 * 1000,
  });

  const {
    data: catalogData,
    isLoading: catalogLoading,
    isError: catalogError,
  } = useAppointmentServiceCatalog(initialServiceCatalog);

  const catalogServices = useMemo(
    () => catalogData?.services ?? [],
    [catalogData?.services]
  );

  const filteredCatalogServices = useMemo(
    () => filterServiceCatalog(catalogServices, catalogFilters),
    [catalogServices, catalogFilters]
  );

  const filteredDoctors = useMemo(() => {
    const list = doctorsData?.doctors ?? [];
    return filterDoctors(list, filters, catalogServices);
  }, [doctorsData?.doctors, filters, catalogServices]);

  const doctors = doctorsData?.doctors ?? [];

  const hasActiveCatalogFilter =
    catalogFilters.selection !== SERVICES_CATALOG_FILTER_ALL;

  const hasActiveFilters =
    filters.search.trim().length > 0 ||
    filters.specialty != null ||
    filters.weekday != null ||
    filters.date != null ||
    filters.serviceSelection !== SERVICES_CATALOG_FILTER_ALL;

  return (
    <div className={appPortalSectionRootClass}>
      <PortalPageChrome route="services" />

      <section>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-sky-100 border border-sky-200 shrink-0">
              <Stethoscope className="h-3.5 w-3.5 text-sky-600" />
            </span>
            <h2 className="text-base text-gray-700 font-semibold">Our Doctors</h2>
            {doctorsLoading && !doctors.length ? (
              <Skeleton className="h-5 w-8 rounded-full" />
            ) : (
              <Badge variant="outline" className="bg-sky-50 text-sky-700 border-sky-200 font-normal">
                {filteredDoctors.length}
              </Badge>
            )}
          </div>

          <ServicesDoctorFilters
            catalogServices={catalogServices}
            filters={filters}
            onChange={setFilters}
            onReset={() => setFilters(defaultServicesDoctorFilters())}
            hasActiveFilters={hasActiveFilters}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {doctorsLoading && !doctors.length ? (
            Array.from({ length: 8 }).map((_, i) => <DoctorProfileCardSkeleton key={i} />)
          ) : doctorsError ? (
            <AppSectionErrorBanner className="col-span-full">
              Failed to load doctors. Please refresh.
            </AppSectionErrorBanner>
          ) : filteredDoctors.length === 0 ? (
            <div className="col-span-full text-center py-12 text-muted-foreground">
              <Stethoscope className="h-10 w-10 mx-auto mb-2 opacity-30" />
              No doctors match your filters.
            </div>
          ) : (
            filteredDoctors.map((doc) => <DoctorProfileCard key={doc.id} doctor={doc} />)
          )}
        </div>
      </section>

      <section>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mt-4 mb-4">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-violet-100 border border-violet-200 shrink-0">
              <Activity className="h-3.5 w-3.5 text-violet-600" />
            </span>
            <h2 className="text-base text-gray-700 font-semibold">Appointment Services</h2>
            {catalogLoading && !catalogServices.length ? (
              <Skeleton className="h-5 w-8 rounded-full" />
            ) : (
              <Badge variant="outline" className="bg-violet-50 text-violet-700 border-violet-200 font-normal">
                {filteredCatalogServices.length}
              </Badge>
            )}
          </div>

          <ServicesServiceFilters
            services={catalogServices}
            filters={catalogFilters}
            onChange={setCatalogFilters}
            onReset={() => setCatalogFilters(defaultServicesCatalogFilter())}
            hasActiveFilter={hasActiveCatalogFilter}
          />
        </div>

        {catalogLoading && !catalogServices.length ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-[16px]" />
            ))}
          </div>
        ) : catalogError ? (
          <AppSectionErrorBanner>
            Failed to load services. Please refresh.
          </AppSectionErrorBanner>
        ) : catalogServices.length === 0 ? (
          <p className="text-sm text-muted-foreground">No services listed yet.</p>
        ) : filteredCatalogServices.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Activity className="h-10 w-10 mx-auto mb-2 opacity-30" />
            No services match this filter.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filteredCatalogServices.map((s) => (
              <ServiceCatalogCard key={`${s.source}-${s.id}`} service={s} />
            ))}
          </div>
        )}
        <VisitFeeInfoNoteCard variant="panel">
          {buildServicesVisitFeePolicyNote()}
        </VisitFeeInfoNoteCard>
      </section>
    </div>
  );
}
