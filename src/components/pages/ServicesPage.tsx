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
import {
  Activity,
  CalendarClock,
  CalendarPlus,
  Check,
  Clock,
  Copy,
  Stethoscope,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { queryKeys } from "@/lib/query-keys";
import { apiClient } from "@/lib/api-client";
import { SERVICES_CATALOG_FILTER_ALL, type ServiceCatalogRow } from "@/lib/appointment-service-catalog";
import type { DoctorBookableTypeRow } from "@/lib/doctor-bookable-types";
import { filterDoctorsByServiceCatalog } from "@/lib/services-doctor-catalog-filter";
import { useAppointmentServiceCatalog } from "@/hooks/useAppointmentServiceCatalog";
import { ServiceCatalogCard } from "@/components/services/ServiceCatalogCard";
import { PatientBookingDialog } from "@/components/shared/patient-booking/PatientBookingDialog";
import { prefetchAppointmentTypesForDoctor } from "@/lib/prefetch-appointment-types";
import { prefetchDoctorsDirectory } from "@/lib/prefetch-doctors-directory";
import { RoleEntityLink } from "@/components/shared/RoleEntityLink";
import { DoctorSpecialtyBadge } from "@/components/shared/doctor-display/DoctorSpecialtyBadge";
import { DoctorCardHeroImage } from "@/components/shared/doctor-display/DoctorCardHeroImage";
import { DoctorAvailabilityGroups } from "@/components/shared/doctor-display/DoctorAvailabilityGroups";
import { PortalChromeHeader } from "@/components/shared/PortalChromeHeader";
import { AppSectionErrorBanner } from "@/components/shared/AppSectionErrorBanner";
import { appPortalSectionRootClass } from "@/lib/section-page-layout";
import { DoctorProfileCardSkeleton } from "@/components/shared/services/DoctorProfileCardSkeleton";
import {
  ServicesDoctorFilters,
  defaultServicesDoctorFilters,
  type ServicesDoctorFilterState,
} from "@/components/services/ServicesDoctorFilters";

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
}

/** Copy email with brief check icon feedback — local state only (no navigation). */
function DoctorEmailRow({ email }: { email: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard denied — ignore */
    }
  };

  return (
    <div className="flex items-center gap-1 min-w-0">
      <p className="text-xs text-muted-foreground truncate">{email}</p>
      <button
        type="button"
        onClick={handleCopy}
        className="shrink-0 rounded-md p-1 text-muted-foreground hover:bg-sky-50 hover:text-sky-700 transition-colors"
        aria-label={copied ? "Copied" : "Copy email"}
      >
        {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
      </button>
    </div>
  );
}

/** Single doctor card — hover prefetches visit types for instant booking step 1. */
function DoctorProfileCard({ doctor }: { doctor: DoctorCard }) {
  const queryClient = useQueryClient();
  const name = doctor.display_name ?? doctor.email;

  const warmBookingTypes = () => {
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
          <DoctorSpecialtyBadge specialty={doctor.specialty} className="self-start" />
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
            {doctor.appointment_types.length} type{doctor.appointment_types.length !== 1 ? "s" : ""}
          </span>
        </div>

        <div className="flex-1" />

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

  const filteredDoctors = useMemo(() => {
    const list = doctorsData?.doctors ?? [];
    return filterDoctors(list, filters, catalogServices);
  }, [doctorsData?.doctors, filters, catalogServices]);

  const doctors = doctorsData?.doctors ?? [];

  const hasActiveFilters =
    filters.search.trim().length > 0 ||
    filters.specialty != null ||
    filters.weekday != null ||
    filters.date != null ||
    filters.serviceSelection !== SERVICES_CATALOG_FILTER_ALL;

  return (
    <div className={appPortalSectionRootClass}>
      <PortalChromeHeader
        icon={Stethoscope}
        title="Doctors & Services"
        description="Browse our specialist doctors and available appointment services and book your appointment with ease."
      />

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
              <Badge variant="outline" className="bg-sky-50 text-sky-700 border-sky-200 font-bold">
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
              <Badge variant="outline" className="bg-violet-50 text-violet-700 border-violet-200 font-bold">
                {catalogServices.length}
              </Badge>
            )}
          </div>
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
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {catalogServices.map((s) => (
              <ServiceCatalogCard key={`${s.source}-${s.id}`} service={s} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
