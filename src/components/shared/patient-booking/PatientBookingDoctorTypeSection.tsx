"use client";

import { Clock, Stethoscope, Timer } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { DoctorSelectOption } from "@/components/shared/doctor-display/DoctorSelectOption";
import { DoctorIdentityRow } from "@/components/shared/doctor-display/DoctorIdentityRow";
import { cn } from "@/lib/utils";
import type { PatientBookingAppointmentType } from "@/lib/patient-booking-wizard";
import type { User as AppUser } from "@/types/types";
import {
  patientBookingGlassSelectTriggerClass,
  patientBookingGlassTileClass,
  patientBookingGlassTileSelectedClass,
} from "@/components/shared/patient-booking/patient-booking-dialog-styles";

type PatientBookingDoctorTypeSectionProps = {
  lockDoctor: boolean;
  doctors: AppUser[];
  selectedDoctor: AppUser | undefined;
  doctorId: string;
  onDoctorIdChange: (id: string) => void;
  typesLoading: boolean;
  isFlexible: boolean;
  types: PatientBookingAppointmentType[];
  selectedType: PatientBookingAppointmentType | null;
  onSelectType: (type: PatientBookingAppointmentType) => void;
  flexDuration: number;
  onFlexDurationChange: (minutes: number) => void;
};

/** Step 1 — doctor picker (or locked identity) + visit type / flexible duration. */
export function PatientBookingDoctorTypeSection({
  lockDoctor,
  doctors,
  selectedDoctor,
  doctorId,
  onDoctorIdChange,
  typesLoading,
  isFlexible,
  types,
  selectedType,
  onSelectType,
  flexDuration,
  onFlexDurationChange,
}: PatientBookingDoctorTypeSectionProps) {
  return (
    <section className="space-y-4" aria-labelledby="pb-doctor-type-heading">
      <h3
        id="pb-doctor-type-heading"
        className="text-sm font-semibold tracking-tight text-gray-700"
      >
        Preferred doctor & visit type
      </h3>

      <div className="space-y-1.5">
        <Label className="flex items-center gap-1.5">
          <Stethoscope className="h-4 w-4 text-sky-600" />
          Preferred Doctor
        </Label>
        {lockDoctor && selectedDoctor ? (
          <div className="rounded-2xl border border-sky-200/60 bg-white/90 p-3 shadow-[0_10px_30px_rgba(2,132,199,0.12)]">
            <DoctorIdentityRow doctor={selectedDoctor} linkKind="none" size="md" />
          </div>
        ) : (
          <Select
            value={doctorId}
            onValueChange={(v) => {
              onDoctorIdChange(v);
            }}
          >
            <SelectTrigger className={patientBookingGlassSelectTriggerClass}>
              <SelectValue placeholder="Select a doctor…" />
            </SelectTrigger>
            <SelectContent>
              {doctors.map((d) => (
                <SelectItem key={d.id} value={d.id} textValue={d.display_name ?? d.email}>
                  <DoctorSelectOption doctor={d} />
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {doctorId ? (
        <div className="space-y-2">
          <Label className="flex items-center gap-1.5">
            <Timer className="h-4 w-4 text-sky-600" />
            Appointment Type
          </Label>
          {typesLoading ? (
            <div className="space-y-2">
              {[1, 2].map((i) => (
                <Skeleton key={i} className="h-16 w-full rounded-2xl" />
              ))}
            </div>
          ) : isFlexible ? (
            <div className="rounded-2xl border border-sky-200/60 bg-sky-50/60 p-4 space-y-2 shadow-[0_10px_30px_rgba(2,132,199,0.1)]">
              <p className="text-sm font-medium text-sky-800">Flexible Booking</p>
              <p className="text-xs text-muted-foreground">
                This doctor hasn&apos;t set fixed appointment types. Choose a duration.
              </p>
              <div className="flex flex-wrap gap-2">
                {[15, 30, 45, 60].map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => onFlexDurationChange(d)}
                    className={cn(
                      "rounded-full border px-3 py-1.5 text-sm font-medium transition-all",
                      flexDuration === d
                        ? "border-sky-500 bg-sky-600 text-white shadow-[0_8px_20px_rgba(2,132,199,0.35)]"
                        : "border-sky-200/80 bg-white/90 text-sky-800 hover:bg-sky-50"
                    )}
                  >
                    {d} min
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="max-h-52 space-y-2 overflow-y-auto pr-1">
              {types.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => onSelectType(t)}
                  className={cn(
                    patientBookingGlassTileClass,
                    selectedType?.id === t.id && patientBookingGlassTileSelectedClass
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-medium">{t.name}</span>
                    <Badge variant="outline" className="gap-1 text-xs calendar-glass-badge-sky">
                      <Clock className="h-3 w-3" />
                      {t.duration_minutes} min
                    </Badge>
                  </div>
                  {t.buffer_before_minutes > 0 || t.buffer_after_minutes > 0 ? (
                    <p className="mt-1 text-xs text-muted-foreground">
                      Buffer: {t.buffer_before_minutes}m before · {t.buffer_after_minutes}m after
                    </p>
                  ) : null}
                </button>
              ))}
            </div>
          )}
        </div>
      ) : null}
    </section>
  );
}
