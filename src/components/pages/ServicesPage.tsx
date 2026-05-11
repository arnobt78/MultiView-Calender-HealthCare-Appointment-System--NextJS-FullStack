"use client";

/**
 * /services — Doctors & Appointment Types directory
 *
 * Two sections:
 *  1. Our Doctors — cards with photo, specialty, bio, availability days, patient count
 *     and a "Book with this doctor" button (opens the booking wizard pre-selected)
 *  2. Appointment Types / Services — global types (user_id = null) with name, duration, description
 *
 * Accessible to all authenticated roles.
 */

import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import {
  Activity,
  CalendarClock,
  CalendarPlus,
  Clock,
  Stethoscope,
  Users,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { queryKeys } from "@/lib/query-keys";
import { apiClient } from "@/lib/api-client";
import { BookAppointmentDialog } from "@/components/pages/PatientPortalPage";

// Weekday label lookup (0=Sun … 6=Sat)
const WEEKDAY_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

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

interface DoctorCard {
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

function minToTime(min: number): string {
  const h = Math.floor(min / 60)
    .toString()
    .padStart(2, "0");
  const m = (min % 60).toString().padStart(2, "0");
  return `${h}:${m}`;
}

/** Compact availability badge row — shows working weekday pills */
function AvailabilityRow({ availabilities }: { availabilities: DoctorAvailability[] }) {
  const days = Array.from(new Set(availabilities.map((a) => a.weekday))).sort();
  if (days.length === 0) return <p className="text-xs text-muted-foreground">No availability set</p>;

  // Derive start/end from first slot for display
  const first = availabilities.find((a) => a.weekday === days[0]);
  const hours = first ? `${minToTime(first.start_min)} – ${minToTime(first.end_min)}` : "";

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {days.map((d) => (
        <Badge key={d} variant="outline" className="text-[10px] px-1.5 py-0 bg-sky-50 text-sky-700 border-sky-200">
          {WEEKDAY_SHORT[d]}
        </Badge>
      ))}
      {hours && <span className="text-[10px] text-muted-foreground ml-1">{hours}</span>}
    </div>
  );
}

/** Single doctor card */
function DoctorProfileCard({ doctor }: { doctor: DoctorCard }) {
  const name = doctor.display_name ?? doctor.email;
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <Card className="rounded-[20px] border bg-card shadow-[0_4px_24px_rgba(2,132,199,0.09)] hover:shadow-[0_8px_32px_rgba(2,132,199,0.18)] transition-all duration-300 overflow-hidden flex flex-col">
      {/* Doctor photo */}
      <div className="relative h-40 bg-sky-50 overflow-hidden">
        {doctor.image ? (
          <Image
            src={doctor.image}
            alt={name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <Avatar className="h-20 w-20">
              <AvatarFallback className="text-xl bg-sky-100 text-sky-700 font-bold">{initials}</AvatarFallback>
            </Avatar>
          </div>
        )}
        {/* Specialty pill overlay */}
        {doctor.specialty && (
          <div className="absolute bottom-2 left-2">
            <Badge className="bg-sky-600/90 text-white border-0 text-xs backdrop-blur-sm">
              <Stethoscope className="h-3 w-3 mr-1" />
              {doctor.specialty}
            </Badge>
          </div>
        )}
      </div>

      <CardContent className="p-4 flex flex-col gap-3 flex-1">
        {/* Name + email */}
        <div>
          <p className="font-bold text-sm leading-tight">{name}</p>
          <p className="text-xs text-muted-foreground">{doctor.email}</p>
        </div>

        {/* Bio */}
        {doctor.bio && (
          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">{doctor.bio}</p>
        )}

        {/* Availability */}
        <div>
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1 flex items-center gap-1">
            <CalendarClock className="h-3 w-3" /> Availability
          </p>
          <AvailabilityRow availabilities={doctor.availabilities} />
        </div>

        {/* Stats row */}
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Users className="h-3.5 w-3.5" />
            {doctor.patient_count} patient{doctor.patient_count !== 1 ? "s" : ""}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {doctor.appointment_types.length} type{doctor.appointment_types.length !== 1 ? "s" : ""}
          </span>
        </div>

        {/* Spacer pushes button to bottom */}
        <div className="flex-1" />

        {/* Book with this doctor button — opens booking wizard pre-selected */}
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
      <CardContent className="p-4 flex items-start gap-3">
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

/** Skeleton grid for loading state */
function DoctorSkeletonGrid({ count = 8 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} className="rounded-[20px] overflow-hidden">
          <Skeleton className="h-40 w-full rounded-none" />
          <div className="p-4 space-y-2">
            <Skeleton className="h-4 w-32 rounded" />
            <Skeleton className="h-3 w-24 rounded" />
            <Skeleton className="h-3 w-full rounded" />
            <Skeleton className="h-3 w-3/4 rounded" />
            <Skeleton className="h-8 w-full rounded-lg mt-3" />
          </div>
        </Card>
      ))}
    </>
  );
}

export default function ServicesPage() {
  const { data: doctorsData, isLoading: doctorsLoading } = useQuery({
    queryKey: queryKeys.doctors.all,
    queryFn: () => apiClient<{ doctors: DoctorCard[] }>("/api/doctors"),
    staleTime: 5 * 60 * 1000,
  });

  // Global appointment types (user_id = null) — rendered as "Services" section
  const { data: globalTypesData, isLoading: typesLoading } = useQuery({
    queryKey: queryKeys.appointmentTypes.global,
    queryFn: () => apiClient<{ types: AppointmentTypeCard[] }>("/api/appointment-types/global"),
    staleTime: 5 * 60 * 1000,
  });

  const doctors = doctorsData?.doctors ?? [];
  const globalTypes: AppointmentTypeCard[] = globalTypesData?.types ?? [];

  return (
    <div className="space-y-8 py-0 pb-6">
      {/* Page header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 pb-4 border-b">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold tracking-tight flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-sky-100 border border-sky-200">
              <Stethoscope className="h-5 w-5 text-sky-600" />
            </span>
            Doctors &amp; Services
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Browse our specialist doctors and available appointment services
          </p>
        </div>
      </div>

      {/* ── Our Doctors ───────────────────────────────────────── */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-sky-100 border border-sky-200 shrink-0">
            <Stethoscope className="h-3.5 w-3.5 text-sky-600" />
          </span>
          <h2 className="text-base font-semibold">Our Doctors</h2>
          {!doctorsLoading && (
            <Badge variant="outline" className="bg-sky-50 text-sky-700 border-sky-200 font-bold">
              {doctors.length}
            </Badge>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {doctorsLoading ? (
            <DoctorSkeletonGrid count={8} />
          ) : doctors.length === 0 ? (
            <div className="col-span-full text-center py-12 text-muted-foreground">
              <Stethoscope className="h-10 w-10 mx-auto mb-2 opacity-30" />
              No doctors found.
            </div>
          ) : (
            doctors.map((doc) => <DoctorProfileCard key={doc.id} doctor={doc} />)
          )}
        </div>
      </section>

      {/* ── Appointment Types / Services ──────────────────────── */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-violet-100 border border-violet-200 shrink-0">
            <Activity className="h-3.5 w-3.5 text-violet-600" />
          </span>
          <h2 className="text-base font-semibold">Appointment Services</h2>
          {!doctorsLoading && globalTypes.length > 0 && (
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
