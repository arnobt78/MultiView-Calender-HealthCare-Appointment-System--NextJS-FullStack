"use client";

import type { ReactNode } from "react";

/**
 * Read-only doctor + visit type summary for booking steps 2 and 3.
 * Uses `DoctorAvatar` + `DoctorSpecialtyBadge` (same sources as directory picker / `useDoctorDisplay`).
 */

import { addMinutes, format } from "date-fns";
import { CalendarDays, Clock, MapPin, Timer } from "lucide-react";
import { AppointmentVisitScheduleMeta } from "@/components/shared/appointments/AppointmentVisitScheduleMeta";
import { resolveAppointmentVisitLocationLabel } from "@/lib/appointment-visit-location";
import { Badge } from "@/components/ui/badge";
import { DoctorAvatar } from "@/components/shared/doctor-display/DoctorAvatar";
import { DoctorAvailabilityGroups } from "@/components/shared/doctor-display/DoctorAvailabilityGroups";
import { DoctorSpecialtyBadge } from "@/components/shared/doctor-display/DoctorSpecialtyBadge";
import { VisitFeeBadge } from "@/components/shared/billing/VisitFeeBadge";
import { formatAppointmentTypeSchedulingBracket } from "@/lib/appointment-type-scheduling-meta";
import { resolveBookingVisitFeeDisplay } from "@/lib/appointment-visit-fee-display";
import { bookingWizardTypeBadgeClass } from "@/lib/visit-fee-badge-ui-classes";
import { cn } from "@/lib/utils";
import type { PatientBookingAppointmentType } from "@/lib/patient-booking-wizard";
import type { DoctorDirectoryRow } from "@/lib/doctor-directory";
/** Shared glass context card — steps 2 (above date) and 3 (confirm summary). */
export const patientBookingScheduleContextClass =
  "rounded-2xl border border-sky-200/60 bg-gradient-to-br from-sky-50/90 via-white to-white p-3 shadow-[0_10px_30px_rgba(2,132,199,0.1)]";

/** Tall portrait so the avatar spans name + meta lines (steps 2 and 3). */
const patientBookingContextAvatarClass = "h-16 w-16 shrink-0";

type PatientBookingDoctorVisitSummaryProps = {
  doctor: DoctorDirectoryRow;
  selectedType: PatientBookingAppointmentType | null;
  isFlexible: boolean;
  flexDuration: number;
  layout: "schedule" | "confirm";
  dateStr?: string;
  selectedSlot?: string | null;
  duration?: number;
  className?: string;
};

function doctorDisplayLabel(doctor: DoctorDirectoryRow): string {
  const raw = doctor.display_name?.trim() || doctor.email?.trim() || "Doctor";
  return raw.startsWith("Dr.") ? raw : `Dr. ${raw}`;
}

/** Type price when set; else doctor/default fee with · est. (appointment card parity). */
function BookingVisitFeeBadge({
  doctor,
  selectedType,
  isFlexible,
}: {
  doctor: DoctorDirectoryRow;
  selectedType: PatientBookingAppointmentType | null;
  isFlexible: boolean;
}) {
  const fee = resolveBookingVisitFeeDisplay({
    selectedType,
    doctorConsultationFeeCents: doctor.consultation_fee,
    isFlexible,
  });
  if (!fee) return null;
  return (
    <VisitFeeBadge
      size="wizard"
      priceCents={fee.cents}
      showEstimateHint={fee.showEstimateHint}
    />
  );
}

function VisitTypeBadge({
  selectedType,
  isFlexible,
  flexDuration,
}: {
  selectedType: PatientBookingAppointmentType | null;
  isFlexible: boolean;
  flexDuration: number;
}) {
  if (isFlexible) {
    return (
      <Badge variant="outline" className={bookingWizardTypeBadgeClass}>
        <Clock className="h-3 w-3" />
        Flexible · {flexDuration} min
      </Badge>
    );
  }
  if (!selectedType) return null;
  return (
    <Badge variant="outline" className={bookingWizardTypeBadgeClass}>
      <Timer className="h-3 w-3" />
      {selectedType.name} · {selectedType.duration_minutes} min
    </Badge>
  );
}

function resolveBookingIsTelehealth(
  selectedType: PatientBookingAppointmentType | null,
  isFlexible: boolean
): boolean {
  if (isFlexible || !selectedType) return false;
  return Boolean(selectedType.is_telehealth);
}

/** Doctor office preview — hidden for telehealth visit types. */
function BookingVisitLocationPreview({
  doctor,
  isTelehealth,
}: {
  doctor: DoctorDirectoryRow;
  isTelehealth: boolean;
}) {
  const label = resolveAppointmentVisitLocationLabel({
    office_location: doctor.office_location,
    is_telehealth: isTelehealth,
  });
  if (!label) {
    // Visit type badge already labels telehealth sessions — no extra location/badge row.
    return null;
  }
  return (
    <p className="flex items-center gap-1.5 text-[10px] leading-snug text-sky-800">
      <MapPin className="h-3 w-3 shrink-0 text-sky-600" aria-hidden />
      <span>{label}</span>
    </p>
  );
}

function formatConfirmDateTimeLine(
  dateStr: string,
  selectedSlot: string | null,
  isFlexible: boolean,
  flexDuration: number,
  duration: number
): string {
  const datePart = dateStr
    ? format(new Date(`${dateStr}T12:00:00`), "EEEE, dd MMM yyyy")
    : "—";
  if (selectedSlot) {
    const start = format(new Date(selectedSlot), "HH:mm");
    const end = format(addMinutes(new Date(selectedSlot), duration), "HH:mm");
    return `${datePart} · ${start} → ${end}`;
  }
  if (isFlexible) return `${datePart} · ${flexDuration} min`;
  return datePart;
}

/** Visit type + “Availability” label + weekday pills in one wrapping row (picker inline layout). */
function PatientBookingScheduleMetaRow({
  doctor,
  availabilities,
  selectedType,
  isFlexible,
  flexDuration,
}: {
  doctor: DoctorDirectoryRow;
  availabilities: DoctorDirectoryRow["availabilities"];
  selectedType: PatientBookingAppointmentType | null;
  isFlexible: boolean;
  flexDuration: number;
}) {
  return (
    <div className="flex min-w-0 flex-wrap items-center gap-x-1.5 gap-y-1">
      {(isFlexible || selectedType) && (
        <>
          <VisitTypeBadge
            selectedType={selectedType}
            isFlexible={isFlexible}
            flexDuration={flexDuration}
          />
          <BookingVisitFeeBadge
            doctor={doctor}
            selectedType={selectedType}
            isFlexible={isFlexible}
          />
        </>
      )}
      <span className="shrink-0 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
        Availability
      </span>
      <DoctorAvailabilityGroups availabilities={availabilities} layout="inline" />
    </div>
  );
}

function formatScheduleSelectedLine(
  dateStr: string,
  selectedSlot: string | null,
  isFlexible: boolean,
  flexDuration: number,
  duration: number
): string | null {
  if (!dateStr) return null;
  const datePart = format(new Date(`${dateStr}T12:00:00`), "EEE, dd MMM yyyy");
  if (selectedSlot) {
    const start = format(new Date(selectedSlot), "HH:mm");
    const end = format(addMinutes(new Date(selectedSlot), duration), "HH:mm");
    return `${datePart} · ${start} → ${end}`;
  }
  if (isFlexible) return `${datePart} · ${flexDuration} min`;
  return `${datePart} · choose a slot below`;
}

/** Avatar + stacked meta — `gap` only (no per-row margins). */
function PatientBookingDoctorVisitContextColumn({
  doctor,
  children,
  className,
}: {
  doctor: DoctorDirectoryRow;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn(patientBookingScheduleContextClass, className)}>
      <div className="flex items-stretch gap-3">
        <div className="flex w-16 shrink-0 self-stretch">
          <DoctorAvatar
            doctor={doctor}
            sizeClassName="h-full min-h-[4.5rem] w-16"
            className="rounded-xl"
          />
        </div>
        <div className="flex min-w-0 flex-1 flex-col justify-center gap-1.5">{children}</div>
      </div>
    </div>
  );
}

/** Step 2 — row 1: name + specialty; row 2: visit type + doctor availability (picker parity). */
function ScheduleLayout({
  doctor,
  selectedType,
  isFlexible,
  flexDuration,
  dateStr = "",
  selectedSlot = null,
  duration = 30,
  className,
}: Omit<PatientBookingDoctorVisitSummaryProps, "layout">) {
  const selectedLine = formatScheduleSelectedLine(
    dateStr,
    selectedSlot,
    isFlexible,
    flexDuration,
    duration
  );
  const isTelehealth = resolveBookingIsTelehealth(selectedType, isFlexible);

  return (
    <PatientBookingDoctorVisitContextColumn doctor={doctor} className={className}>
      <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
        <p className="truncate text-sm font-semibold leading-tight text-sky-900">
          {doctorDisplayLabel(doctor)}
        </p>
        {doctor.specialty?.trim() ? (
          <DoctorSpecialtyBadge specialty={doctor.specialty} showIcon />
        ) : null}
      </div>
      <PatientBookingScheduleMetaRow
        doctor={doctor}
        availabilities={doctor.availabilities}
        selectedType={selectedType}
        isFlexible={isFlexible}
        flexDuration={flexDuration}
      />
      {selectedLine ? (
        <AppointmentVisitScheduleMeta
          dateTimeLabel={
            <>
              <span className="font-semibold text-sky-900">Selected: </span>
              {selectedLine}
            </>
          }
          office_location={doctor.office_location}
          is_telehealth={isTelehealth}
          showTelehealthBadge={isTelehealth}
          className="text-[10px] leading-snug text-sky-800"
        />
      ) : (
        <BookingVisitLocationPreview doctor={doctor} isTelehealth={isTelehealth} />
      )}
    </PatientBookingDoctorVisitContextColumn>
  );
}

/** Step 3 — row 1: name + specialty inline; date/time + buffer bracket; visit type badge. */
function ConfirmLayout({
  doctor,
  selectedType,
  isFlexible,
  flexDuration,
  dateStr = "",
  selectedSlot = null,
  duration = 30,
  className,
}: Omit<PatientBookingDoctorVisitSummaryProps, "layout">) {
  const dateTimeLine = formatConfirmDateTimeLine(
    dateStr,
    selectedSlot,
    isFlexible,
    flexDuration,
    duration
  );
  const schedulingBracket = !isFlexible
    ? formatAppointmentTypeSchedulingBracket(selectedType ?? undefined)
    : null;
  const isTelehealth = resolveBookingIsTelehealth(selectedType, isFlexible);

  return (
    <PatientBookingDoctorVisitContextColumn doctor={doctor} className={className}>
      <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 break-words">
        <p className="text-sm font-semibold leading-tight text-sky-900 break-words">
          {doctorDisplayLabel(doctor)}
        </p>
        {doctor.specialty?.trim() ? (
          <DoctorSpecialtyBadge specialty={doctor.specialty} showIcon />
        ) : null}
      </div>
      <AppointmentVisitScheduleMeta
        dateTimeLabel={
          <span className="min-w-0 break-words">
            {dateTimeLine}
            {schedulingBracket ? (
              <span className="text-muted-foreground"> ({schedulingBracket})</span>
            ) : null}
          </span>
        }
        office_location={doctor.office_location}
        is_telehealth={isTelehealth}
        showTelehealthBadge={isTelehealth}
        className="text-sm leading-snug text-sky-800"
      />
      {selectedType || isFlexible ? (
        <div className="flex flex-wrap items-center gap-x-1.5 gap-y-1">
          <VisitTypeBadge
            selectedType={selectedType}
            isFlexible={isFlexible}
            flexDuration={flexDuration}
          />
          <BookingVisitFeeBadge
            doctor={doctor}
            selectedType={selectedType}
            isFlexible={isFlexible}
          />
        </div>
      ) : null}
    </PatientBookingDoctorVisitContextColumn>
  );
}

export function PatientBookingDoctorVisitSummary(props: PatientBookingDoctorVisitSummaryProps) {
  const { layout, doctor, className, ...rest } = props;
  if (layout === "schedule") {
    return (
      <ScheduleLayout
        doctor={doctor}
        className={className}
        selectedType={rest.selectedType}
        isFlexible={rest.isFlexible}
        flexDuration={rest.flexDuration}
        dateStr={rest.dateStr}
        selectedSlot={rest.selectedSlot}
        duration={rest.duration}
      />
    );
  }
  return (
    <ConfirmLayout
      doctor={doctor}
      className={className}
      selectedType={rest.selectedType}
      isFlexible={rest.isFlexible}
      flexDuration={rest.flexDuration}
      dateStr={rest.dateStr}
      selectedSlot={rest.selectedSlot}
      duration={rest.duration}
    />
  );
}
