"use client";

/**
 * /services — Doctors & Appointment Types directory
 *
 * Two sections:
 *  1. Our Doctors — cards with photo, specialty, bio, availability days, patient count
 *     and a "Book with this doctor" button (opens the booking wizard pre-selected)
 *  2. Appointment Types / Services — global types (user_id = null) with name, duration, description
 *
 * Accepts optional `initialDoctors` / `initialGlobalTypes` from the server page for SSR cache seeding
 * (no loading flash on first paint — static text/icons stay visible while only dynamic data pulses).
 */

import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useLayoutEffect } from "react";
import {
  Activity,
  AlertCircle,
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
import { BookAppointmentDialog } from "@/components/pages/PatientPortalPage";
import { RoleEntityLink } from "@/components/shared/RoleEntityLink";
import { DoctorSpecialtyBadge } from "@/components/shared/doctor-display/DoctorSpecialtyBadge";
import { DoctorCardHeroImage } from "@/components/shared/doctor-display/DoctorCardHeroImage";
import { DoctorAvailabilityGroups } from "@/components/shared/doctor-display/DoctorAvailabilityGroups";
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

interface AppointmentTypeCard {
  id: string;
  name: string;
  description: string | null;
  duration_minutes: number;
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
  appointment_types: AppointmentTypeCard[];
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

/** Single doctor card */
function DoctorProfileCard({ doctor }: { doctor: DoctorCard }) {
  const name = doctor.display_name ?? doctor.email;

  return (
    <Card className="rounded-[20px] border-0 bg-card shadow-[0_4px_24px_rgba(2,132,199,0.09)] hover:shadow-[0_8px_32px_rgba(2,132,199,0.18)] transition-all duration-300 overflow-hidden flex flex-col p-0 gap-0">
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

        <div>
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1 flex items-center gap-1">
            <CalendarClock className="h-3 w-3" /> Availability
          </p>
          <DoctorAvailabilityGroups availabilities={doctor.availabilities} />
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

        <BookAppointmentDialog
          preselectedDoctorId={doctor.id}
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

/** Single appointment-type service card */
function ServiceCard({ type }: { type: AppointmentTypeCard }) {
  return (
    <Card className="rounded-[16px] border bg-card shadow-[0_4px_16px_rgba(139,92,246,0.08)] hover:shadow-[0_8px_24px_rgba(139,92,246,0.16)] transition-all duration-300">
      <CardContent className="p-4 flex items-start gap-2">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 border border-violet-200 shrink-0">
          <Clock className="h-5 w-5 text-violet-600" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-sm leading-tight">{type.name}</p>
          {type.description && (
            <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{type.description}</p>
          )}
          <div className="flex items-center gap-1.5 mt-1.5">
            <Badge variant="outline" className="text-[10px] py-0 bg-violet-50 text-violet-700 border-violet-200">
              <Clock className="h-2.5 w-2.5 mr-0.5" />
              {type.duration_minutes} min
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function DoctorSkeletonGrid({ count = 8 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} className="rounded-[20px] overflow-hidden p-0 gap-0">
          <Skeleton className="h-40 w-full rounded-none" />
          <div className="p-4 space-y-2">
            <Skeleton className="h-4 w-32 rounded" />
            <Skeleton className="h-3 w-24 rounded" />
            <Skeleton className="h-3 w-full rounded" />
            <Skeleton className="h-3 w-3/4 rounded" />
            <div className="h-8 w-full mt-3" />
          </div>
        </Card>
      ))}
    </>
  );
}

function filterDoctors(doctors: DoctorCard[], filters: ServicesDoctorFilterState): DoctorCard[] {
  const q = filters.search.trim().toLowerCase();
  return doctors.filter((d) => {
    if (filters.specialty && d.specialty !== filters.specialty) return false;
    if (filters.weekday != null) {
      const hasDay = d.availabilities.some((a) => a.weekday === filters.weekday);
      if (!hasDay) return false;
    }
    if (!q) return true;
    const blob = [
      d.display_name,
      d.email,
      d.specialty,
      d.bio,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    return blob.includes(q);
  });
}

interface ServicesPageProps {
  initialDoctors?: unknown[];
  initialGlobalTypes?: unknown[];
}

export default function ServicesPage({ initialDoctors, initialGlobalTypes }: ServicesPageProps) {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<ServicesDoctorFilterState>(defaultServicesDoctorFilters);

  useLayoutEffect(() => {
    if (initialDoctors?.length) {
      queryClient.setQueryData(queryKeys.doctors.all, { doctors: initialDoctors as DoctorCard[] });
    }
    if (initialGlobalTypes?.length) {
      queryClient.setQueryData(queryKeys.appointmentTypes.global, { types: initialGlobalTypes as AppointmentTypeCard[] });
    }
  }, [queryClient, initialDoctors, initialGlobalTypes]);

  const { data: doctorsData, isLoading: doctorsLoading, isError: doctorsError } = useQuery({
    queryKey: queryKeys.doctors.all,
    queryFn: () => apiClient<{ doctors: DoctorCard[] }>("/api/doctors"),
    staleTime: 5 * 60 * 1000,
  });

  const { data: globalTypesData, isLoading: typesLoading, isError: typesError } = useQuery({
    queryKey: queryKeys.appointmentTypes.global,
    queryFn: () => apiClient<{ types: AppointmentTypeCard[] }>("/api/appointment-types/global"),
    staleTime: 5 * 60 * 1000,
  });

  const filteredDoctors = useMemo(() => {
    const list = doctorsData?.doctors ?? [];
    return filterDoctors(list, filters);
  }, [doctorsData?.doctors, filters]);

  const globalTypes: AppointmentTypeCard[] = globalTypesData?.types ?? [];
  const doctors = doctorsData?.doctors ?? [];

  const hasActiveFilters =
    filters.search.trim().length > 0 ||
    filters.specialty != null ||
    filters.weekday != null ||
    filters.date != null;

  return (
    <div className="space-y-4 py-0 pb-3">
      {/* Page header — icon height spans title + subtitle */}
      <div className="flex gap-2 py-2 border-b items-stretch">
        <span className="flex w-12 shrink-0 items-center justify-center rounded-xl bg-sky-100 border border-sky-200 self-stretch min-h-[3.5rem]">
          <Stethoscope className="h-6 w-6 text-sky-600" />
        </span>
        <div className="flex flex-col justify-center min-w-0">
          <h1 className="text-xl md:text-2xl text-gray-700 font-semibold tracking-tight">
            Doctors &amp; Services
          </h1>
          <p className="text-muted-foreground text-sm">
            Browse our specialist doctors and available appointment services and book your appointment with ease.
          </p>
        </div>
      </div>

      <section>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-sky-100 border border-sky-200 shrink-0">
              <Stethoscope className="h-3.5 w-3.5 text-sky-600" />
            </span>
            <h2 className="text-base text-gray-700 font-semibold">Our Doctors</h2>
            {doctorsLoading ? (
              <Skeleton className="h-5 w-8 rounded-full" />
            ) : (
              <Badge variant="outline" className="bg-sky-50 text-sky-700 border-sky-200 font-bold">
                {filteredDoctors.length}
              </Badge>
            )}
          </div>

          <ServicesDoctorFilters
            filters={filters}
            onChange={setFilters}
            onReset={() => setFilters(defaultServicesDoctorFilters())}
            hasActiveFilters={hasActiveFilters}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {doctorsLoading ? (
            <DoctorSkeletonGrid count={8} />
          ) : doctorsError ? (
            <div className="col-span-full rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              Failed to load doctors. Please refresh.
            </div>
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
        <div className="flex items-center gap-2 mb-4">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-violet-100 border border-violet-200 shrink-0">
            <Activity className="h-3.5 w-3.5 text-violet-600" />
          </span>
          <h2 className="text-base text-gray-700 font-semibold">Appointment Services</h2>
          {!typesLoading && globalTypes.length > 0 && (
            <Badge variant="outline" className="bg-violet-50 text-violet-700 border-violet-200 font-bold">
              {globalTypes.length}
            </Badge>
          )}
        </div>

        {doctorsLoading || typesLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-[16px]" />
            ))}
          </div>
        ) : typesError ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            Failed to load services. Please refresh.
          </div>
        ) : globalTypes.length === 0 ? (
          <p className="text-sm text-muted-foreground">No services listed yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {globalTypes.map((t) => (
              <ServiceCard key={t.id} type={t} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
