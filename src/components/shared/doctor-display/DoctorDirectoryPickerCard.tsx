"use client";

import { SafeImage } from "@/components/ui/safe-image";
import { DoctorAvailabilityGroups } from "@/components/shared/doctor-display/DoctorAvailabilityGroups";
import { DoctorDirectoryServiceChips } from "@/components/shared/doctor-display/DoctorDirectoryServiceChips";
import { DoctorSpecialtyBadge } from "@/components/shared/doctor-display/DoctorSpecialtyBadge";
import { EntityActiveStatusBadge } from "@/components/shared/entity-display/EntityActiveStatusBadge";
import { useDoctorDisplayOptional } from "@/context/DoctorDisplayContext";
import { resolveDoctorBookableTypes, type DoctorDirectoryRow } from "@/lib/doctor-directory";
import { isDoctorActive } from "@/lib/entity-active-status";
import {
  patientBookingGlassTileClass,
  patientBookingGlassTileSelectedClass,
} from "@/components/shared/patient-booking/patient-booking-dialog-styles";
import { cn } from "@/lib/utils";

/** Same shell as `VisitTypePickerList` tiles — aligned width and `rounded-2xl`. */
const pickerShellClass = patientBookingGlassTileClass;
const pickerSelectedClass = patientBookingGlassTileSelectedClass;

type DoctorDirectoryPickerCardProps = {
  doctor: DoctorDirectoryRow;
  selected?: boolean;
  /** Locked preview on `/services` — same layout, no button interaction */
  readOnly?: boolean;
  onSelect?: (doctorId: string) => void;
  className?: string;
};

/**
 * Full-width doctor row: portrait spans stacked content height; name + specialty on one line;
 * inline availability + bookable service chips (globals + doctor-owned).
 */
export function DoctorDirectoryPickerCard({
  doctor,
  selected = false,
  readOnly = false,
  onSelect,
  className,
}: DoctorDirectoryPickerCardProps) {
  const { getDoctorAvatarSrc } = useDoctorDisplayOptional();
  const label = doctor.display_name?.trim() || doctor.email?.trim() || "Doctor";
  const src = getDoctorAvatarSrc(doctor);
  const serviceTypes = resolveDoctorBookableTypes(doctor);

  const body = (
    <div className="flex w-full items-stretch gap-3">
      <div className="relative min-h-[5.5rem] w-16 shrink-0 self-stretch overflow-hidden rounded-xl bg-sky-50 ring-1 ring-sky-200/80 sm:w-20">
        <SafeImage
          src={src}
          alt={label}
          fill
          sizes="80px"
          className="object-cover object-center"
          loading="lazy"
          referrerPolicy="no-referrer"
        />
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-2 py-0.5">
        <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
          <span className="truncate text-sm font-semibold text-gray-700">{label}</span>
          <DoctorSpecialtyBadge specialty={doctor.specialty} className="shrink-0" />
          <EntityActiveStatusBadge active={isDoctorActive(doctor)} />
        </div>
        <div>
          <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
            Availability
          </p>
          <DoctorAvailabilityGroups availabilities={doctor.availabilities} layout="inline" />
        </div>
        <div>
          <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
            Appointment services
          </p>
          <DoctorDirectoryServiceChips types={serviceTypes} showSchedulingMeta={false} />
        </div>
      </div>
    </div>
  );

  if (readOnly) {
    return (
      <div
        className={cn(pickerShellClass, selected && pickerSelectedClass, className)}
        aria-label={label}
      >
        {body}
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => onSelect?.(doctor.id)}
      aria-pressed={selected}
      className={cn(
        pickerShellClass,
        "cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/60",
        selected && pickerSelectedClass,
        className
      )}
    >
      {body}
    </button>
  );
}
