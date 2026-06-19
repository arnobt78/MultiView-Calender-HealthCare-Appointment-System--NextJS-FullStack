"use client";

import { Badge } from "@/components/ui/badge";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { EntityTitleLink } from "@/components/shared/EntityTitleLink";
import { DoctorSpecialtyBadge } from "@/components/shared/doctor-display/DoctorSpecialtyBadge";
import { doctorDetailHref } from "@/lib/entity-routes";
import { WEEKDAY_LABELS } from "@/lib/doctor-schedule-display";
import type { DoctorRow } from "@/types/types";
import {
  Building2,
  CreditCard,
  Globe,
  Mail,
  MapPin,
  Phone,
  Video,
} from "lucide-react";
import { cn } from "@/lib/utils";

function formatCents(cents: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100);
}

function formatAvailabilityDays(
  availabilities: DoctorRow["availabilities"]
): string[] {
  const weekdays = [...new Set(availabilities.map((a) => a.weekday))].sort((a, b) => a - b);
  return weekdays.map((w) => WEEKDAY_LABELS[w]?.slice(0, 3) ?? `D${w}`);
}

type Props = {
  doctor: DoctorRow;
  className?: string;
};

/** Admin portal doctor directory card — full profile embed without inner scroll truncation. */
export function AdminPortalDoctorDirectoryCard({ doctor, className }: Props) {
  const label = doctor.display_name ?? doctor.email;
  const dayChips = formatAvailabilityDays(doctor.availabilities);
  const languages = doctor.languages_spoken?.filter(Boolean) ?? [];

  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-2xl border border-violet-200/55 bg-white/90 p-4 shadow-[0_14px_48px_-12px_rgba(139,92,246,0.18)]",
        className
      )}
    >
      <div className="flex items-start gap-3">
        <UserAvatar
          src={doctor.image}
          alt={label}
          fallbackText={label.slice(0, 2)}
          sizeClassName="h-11 w-11"
          className="shrink-0"
        />
        <div className="min-w-0 flex-1">
          <EntityTitleLink
            href={doctorDetailHref("admin", doctor.id)}
            label={label}
            className="block truncate text-sm font-semibold"
          />
          {doctor.specialty ? (
            <DoctorSpecialtyBadge specialty={doctor.specialty} className="mt-1" />
          ) : null}
          {doctor.department ? (
            <p className="mt-1 flex items-center gap-1 text-[11px] text-muted-foreground">
              <Building2 className="h-3 w-3 shrink-0" aria-hidden />
              {doctor.department}
            </p>
          ) : null}
        </div>
        <Badge variant="secondary" className="shrink-0 text-[10px]">
          {doctor.patient_count} pts
        </Badge>
      </div>

      <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
        {doctor.email ? (
          <span className="inline-flex items-center gap-1">
            <Mail className="h-3 w-3 shrink-0" aria-hidden />
            {doctor.email}
          </span>
        ) : null}
        {doctor.phone ? (
          <span className="inline-flex items-center gap-1">
            <Phone className="h-3 w-3 shrink-0" aria-hidden />
            {doctor.phone}
          </span>
        ) : null}
        {doctor.office_location ? (
          <span className="inline-flex items-center gap-1">
            <MapPin className="h-3 w-3 shrink-0" aria-hidden />
            {doctor.office_location}
          </span>
        ) : null}
        {doctor.consultation_fee != null ? (
          <span className="inline-flex items-center gap-1">
            <CreditCard className="h-3 w-3 shrink-0" aria-hidden />
            {formatCents(doctor.consultation_fee)}
          </span>
        ) : null}
        {doctor.years_of_experience != null ? (
          <span>{doctor.years_of_experience}y exp</span>
        ) : null}
      </div>

      {languages.length > 0 ? (
        <div className="flex flex-wrap items-center gap-1 text-[10px] text-muted-foreground">
          <Globe className="h-3 w-3 shrink-0" aria-hidden />
          {languages.join(" · ")}
        </div>
      ) : null}

      {dayChips.length > 0 ? (
        <div className="flex flex-wrap gap-1">
          {dayChips.map((day) => (
            <span
              key={day}
              className="rounded-full border border-violet-200/60 bg-violet-50 px-2 py-0.5 text-[10px] font-medium text-violet-800"
            >
              {day}
            </span>
          ))}
        </div>
      ) : null}

      {doctor.appointment_types.length > 0 ? (
        <div className="flex flex-wrap gap-1">
          {doctor.appointment_types.map((t) => (
            <span
              key={t.id}
              className="inline-flex items-center gap-1 rounded-full border border-primary/10 bg-primary/5 px-2 py-0.5 text-[10px] font-normal text-primary"
            >
              {t.is_telehealth ? <Video className="h-2.5 w-2.5" aria-hidden /> : null}
              {t.name}
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
}
