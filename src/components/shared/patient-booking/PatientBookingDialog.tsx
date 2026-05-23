"use client";

/**
 * Patient "Request New Appointment" wizard — glass 90% shell.
 * Three steps (one panel each): doctor & type → date & time → details.
 */

import { useState, type ReactNode } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addMinutes, format } from "date-fns";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  CalendarCheck,
  CalendarPlus,
  Loader2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { apiClient, handleApiError } from "@/lib/api-client";
import { notify } from "@/lib/notify";
import { useAuth } from "@/hooks/useAuth";
import { useDoctorsDirectory } from "@/hooks/useDoctorsDirectory";
import { queryKeys } from "@/lib/query-keys";
import { invalidateAfterAppointmentMutation } from "@/lib/query-client";
import { prefetchAppointmentTypesForDoctor } from "@/lib/prefetch-appointment-types";
import { usePatientBookableAppointmentTypes } from "@/hooks/usePatientBookableAppointmentTypes";
import { prefetchDoctorsDirectory } from "@/lib/prefetch-doctors-directory";
import {
  prefetchSchedulingDay,
  prefetchSchedulingMonthWithAdjacent,
} from "@/lib/prefetch-scheduling";
import type { SchedulingScopeKey } from "@/lib/scheduling/scheduling-types";
import {
  skyGlassBackButtonClass,
  skyGlassPrimaryButtonClass,
} from "@/lib/calendar-header-action-styles";
import {
  canAdvanceFromStep,
  createInitialBookingState,
  getBackStep,
  getNextStep,
  shouldShowConfirmSection,
  shouldShowDoctorTypeSection,
  shouldShowScheduleSection,
  type PatientBookingAppointmentType,
  type PatientBookingStep,
  type PatientBookingWizardState,
} from "@/lib/patient-booking-wizard";
import { PatientBookingDialogHeader } from "@/components/shared/patient-booking/PatientBookingDialogHeader";
import { PatientBookingDoctorTypeSection } from "@/components/shared/patient-booking/PatientBookingDoctorTypeSection";
import { PatientBookingScheduleSection } from "@/components/shared/patient-booking/PatientBookingScheduleSection";
import { PatientBookingConfirmSection } from "@/components/shared/patient-booking/PatientBookingConfirmSection";
import { patientBookingDialogContentClass } from "@/components/shared/patient-booking/patient-booking-dialog-styles";
import type { DoctorDirectoryRow } from "@/lib/doctor-directory";

export type PatientBookingDialogProps = {
  /** Pre-select doctor when opened from /services */
  preselectedDoctorId?: string;
  /** Hide doctor dropdown and show identity card (services book CTA) */
  lockDoctor?: boolean;
  trigger?: ReactNode;
};

interface BookingPayload {
  title: string;
  start: string;
  end: string;
  doctorId: string;
  appointment_type_id?: string;
  chief_complaint?: string;
  notes?: string;
}

/** Step 1/2 need flex-1 in the chain so doctor/type lists get a bounded height and can scroll. */
const bookingStepFillLayoutClass = "flex min-h-0 flex-1 flex-col";

function BookingSectionMotion({
  show,
  children,
  fillStepLayout = false,
}: {
  show: boolean;
  children: ReactNode;
  /** Pass true for doctor + schedule steps (`fillLayout` sections). */
  fillStepLayout?: boolean;
}) {
  const reduceMotion = useReducedMotion();
  const layoutClass = fillStepLayout ? bookingStepFillLayoutClass : undefined;
  if (!show) return null;
  if (reduceMotion) return <div className={layoutClass}>{children}</div>;
  return (
    <motion.div
      className={layoutClass}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}

export function PatientBookingDialog({
  preselectedDoctorId,
  lockDoctor = false,
  trigger,
}: PatientBookingDialogProps = {}) {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<PatientBookingStep>(1);
  const [doctorId, setDoctorId] = useState(preselectedDoctorId ?? "");
  const [selectedType, setSelectedType] = useState<PatientBookingAppointmentType | null>(null);
  const [flexDuration, setFlexDuration] = useState(30);
  const [dateStr, setDateStr] = useState("");
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");

  const { data: doctorsData, isLoading: doctorsDirectoryLoading } = useDoctorsDirectory({
    enabled: open,
  });
  const doctors: DoctorDirectoryRow[] = doctorsData?.doctors ?? [];

  const { types, typesLoading, isFlexible } = usePatientBookableAppointmentTypes({
    doctorId,
    enabled: open,
    doctors,
  });
  const wizardState: PatientBookingWizardState = {
    doctorId,
    selectedType,
    flexDuration,
    dateStr,
    selectedSlot,
    title,
    notes,
    isFlexible,
    typesLoading,
  };

  const duration = isFlexible ? flexDuration : (selectedType?.duration_minutes ?? 30);

  function resetAll() {
    const initial = createInitialBookingState(preselectedDoctorId);
    setStep(1);
    setDoctorId(initial.doctorId);
    setSelectedType(initial.selectedType);
    setFlexDuration(initial.flexDuration);
    setDateStr(initial.dateStr);
    setSelectedSlot(initial.selectedSlot);
    setTitle(initial.title);
    setNotes(initial.notes);
  }

  function handleOpenChange(v: boolean) {
    setOpen(v);
    if (v) {
      const id = preselectedDoctorId ?? doctorId;
      if (preselectedDoctorId) setDoctorId(preselectedDoctorId);
      prefetchDoctorsDirectory(queryClient);
      prefetchAppointmentTypesForDoctor(queryClient, id);
    } else {
      resetAll();
    }
  }

  function schedulingScopeForPrefetch(): SchedulingScopeKey | null {
    if (!doctorId) return null;
    if (isFlexible) {
      return { kind: "flex", durationMinutes: flexDuration };
    }
    if (selectedType?.id) {
      return { kind: "type", typeId: selectedType.id };
    }
    return null;
  }

  function prefetchSchedulingForSelection() {
    const scope = schedulingScopeForPrefetch();
    if (!scope) return;
    prefetchSchedulingMonthWithAdjacent(queryClient, { doctorId, schedulingScope: scope });
    if (dateStr && scope.kind === "type") {
      prefetchSchedulingDay(queryClient, {
        doctorId,
        typeId: scope.typeId,
        dateStr,
      });
    }
  }

  function handleDoctorIdChange(id: string) {
    setDoctorId(id);
    setSelectedType(null);
    setSelectedSlot(null);
    setDateStr("");
  }

  function handleSelectType(type: PatientBookingAppointmentType) {
    setSelectedType(type);
    setSelectedSlot(null);
    setDateStr("");
    if (doctorId && type.id) {
      prefetchSchedulingMonthWithAdjacent(queryClient, {
        doctorId,
        schedulingScope: { kind: "type", typeId: type.id },
      });
    }
  }

  function handleFlexDurationChange(minutes: number) {
    setFlexDuration(minutes);
    setSelectedSlot(null);
    setDateStr("");
    if (doctorId && isFlexible) {
      prefetchSchedulingMonthWithAdjacent(queryClient, {
        doctorId,
        schedulingScope: { kind: "flex", durationMinutes: minutes },
      });
    }
  }

  function handleDateStrChange(value: string) {
    setDateStr(value);
    setSelectedSlot(null);
    if (doctorId && selectedType?.id && value) {
      prefetchSchedulingDay(queryClient, {
        doctorId,
        typeId: selectedType.id,
        dateStr: value,
      });
    }
  }

  function handleNext(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    e.stopPropagation();
    const next = getNextStep(step, wizardState);
    if (next === 2) prefetchSchedulingForSelection();
    setStep(next);
  }

  function handleBack() {
    const prev = getBackStep(step);
    if (prev) setStep(prev);
  }

  const bookMutation = useMutation({
    mutationFn: (body: BookingPayload) =>
      apiClient("/api/patient-portal", { method: "POST", body: JSON.stringify(body) }),
    onSuccess: async () => {
      notify.crud({
        action: "created",
        entity: "Appointment request",
        detail: "Your appointment request was submitted successfully.",
      });
      await queryClient.invalidateQueries({ queryKey: queryKeys.patientPortal.all });
      await invalidateAfterAppointmentMutation(queryClient);
      handleOpenChange(false);
    },
    onError: (e) => handleApiError(e, "Failed to book appointment"),
  });

  /** Explicit button only — avoids implicit form submit (Enter / Next→Confirm click-through). */
  function handleConfirmBooking() {
    if (step !== 3) return;
    if (!doctorId || !selectedSlot || !title.trim()) return;
    if (!isFlexible && !selectedType) return;
    const startDt = new Date(selectedSlot);
    const endDt = addMinutes(startDt, duration);
    const patientLabel =
      user?.display_name?.trim() || user?.email?.trim() || "Patient";
    const typeName = selectedType?.name ?? "Appointment";
    const generatedTitle = `${typeName} · ${patientLabel} · ${format(startDt, "dd MMM yyyy")}`;
    bookMutation.mutate({
      title: generatedTitle,
      start: startDt.toISOString(),
      end: endDt.toISOString(),
      doctorId,
      ...(selectedType?.id ? { appointment_type_id: selectedType.id } : {}),
      chief_complaint: title.trim(),
      ...(notes ? { notes } : {}),
    });
  }

  const selectedDoctor = doctors.find((d) => d.id === doctorId);
  const today = new Date().toISOString().slice(0, 10);
  const backStep = getBackStep(step);
  const canAdvance = canAdvanceFromStep(step, wizardState);
  const showDoctorType = shouldShowDoctorTypeSection(step);
  const showSchedule = shouldShowScheduleSection(step);
  const showConfirm = shouldShowConfirmSection(step);

  const primaryLabel =
    step === 3
      ? bookMutation.isPending
        ? "Submitting…"
        : "Confirm Request"
      : "Next";

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button
            type="button"
            variant="ghost"
            className={cn(skyGlassPrimaryButtonClass, "cursor-pointer px-5 has-[>svg]:px-5")}
          >
            <CalendarPlus className="h-4 w-4" />
            Book Appointment
          </Button>
        )}
      </DialogTrigger>

      <DialogContent
        showCloseButton={false}
        className={patientBookingDialogContentClass}
      >
        <PatientBookingDialogHeader step={step} />

        <form
          id="patient-booking-form"
          onSubmit={(e) => e.preventDefault()}
          className="flex min-h-0 flex-1 flex-col"
        >
          <div
            className={cn(
              "flex min-h-0 flex-1 flex-col px-6 py-4 text-gray-700",
              step === 1 || step === 2 ? "overflow-hidden" : "overflow-y-auto"
            )}
          >
            <BookingSectionMotion show={showDoctorType} fillStepLayout>
              <PatientBookingDoctorTypeSection
                lockDoctor={lockDoctor}
                doctors={doctors}
                doctorsLoading={doctorsDirectoryLoading}
                selectedDoctor={selectedDoctor}
                doctorId={doctorId}
                onDoctorIdChange={handleDoctorIdChange}
                typesLoading={typesLoading}
                isFlexible={isFlexible}
                types={types}
                selectedType={selectedType}
                onSelectType={handleSelectType}
                flexDuration={flexDuration}
                onFlexDurationChange={handleFlexDurationChange}
                fillLayout
              />
            </BookingSectionMotion>

            <BookingSectionMotion show={showSchedule} fillStepLayout>
              <PatientBookingScheduleSection
                today={today}
                dateStr={dateStr}
                onDateStrChange={handleDateStrChange}
                selectedDoctor={selectedDoctor}
                selectedType={selectedType}
                isFlexible={isFlexible}
                flexDuration={flexDuration}
                duration={duration}
                selectedSlot={selectedSlot}
                onSelectSlot={setSelectedSlot}
                fillLayout
              />
            </BookingSectionMotion>

            <BookingSectionMotion show={showConfirm}>
              <PatientBookingConfirmSection
                selectedDoctor={selectedDoctor}
                dateStr={dateStr}
                selectedSlot={selectedSlot}
                isFlexible={isFlexible}
                flexDuration={flexDuration}
                duration={duration}
                selectedType={selectedType}
                title={title}
                onTitleChange={setTitle}
                notes={notes}
                onNotesChange={setNotes}
                onFlexibleTimeChange={setSelectedSlot}
              />
            </BookingSectionMotion>
          </div>

          <div className="flex shrink-0 items-center justify-between gap-3 border-t border-sky-200/60 bg-sky-50/40 px-6 py-3">
            {backStep ? (
              <Button
                type="button"
                variant="ghost"
                className={cn(skyGlassBackButtonClass, "cursor-pointer")}
                onClick={handleBack}
                disabled={bookMutation.isPending}
              >
                <ArrowLeft className="size-4 shrink-0" aria-hidden />
                Back
              </Button>
            ) : (
              <span className="h-10 w-[88px]" aria-hidden />
            )}

            {step === 3 ? (
              <Button
                type="button"
                variant="ghost"
                disabled={bookMutation.isPending || !canAdvance}
                className={cn(skyGlassPrimaryButtonClass, "cursor-pointer")}
                onClick={handleConfirmBooking}
              >
                {bookMutation.isPending ? (
                  <>
                    <Loader2 className="size-4 shrink-0 animate-spin" aria-hidden />
                    Submitting…
                  </>
                ) : (
                  <>
                    <CalendarCheck className="size-4 shrink-0" aria-hidden />
                    Confirm Request
                  </>
                )}
              </Button>
            ) : (
              <Button
                type="button"
                variant="ghost"
                disabled={!canAdvance}
                className={cn(skyGlassPrimaryButtonClass, "cursor-pointer")}
                onClick={handleNext}
              >
                {primaryLabel}
                <ArrowRight className="size-4 shrink-0" aria-hidden />
              </Button>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/** @deprecated Use `PatientBookingDialog` — kept for existing imports. */
export const BookAppointmentDialog = PatientBookingDialog;
