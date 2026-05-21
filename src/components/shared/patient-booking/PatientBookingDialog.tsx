"use client";

/**
 * Patient "Request New Appointment" wizard — glass 90% shell, progressive sections,
 * inline slots under date. Used on patient portal and services (preselected doctor).
 */

import { useState, type ReactNode } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { addMinutes } from "date-fns";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  CalendarCheck,
  CalendarPlus,
  Loader2,
  X,
} from "lucide-react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { apiClient, handleApiError } from "@/lib/api-client";
import { notify } from "@/lib/notify";
import { useUsers } from "@/hooks/useUsers";
import { useAvailabilitySlots } from "@/hooks/useAvailabilitySlots";
import { queryKeys } from "@/lib/query-keys";
import { invalidateAfterAppointmentMutation } from "@/lib/query-client";
import {
  skyGlassBackButtonClass,
  skyGlassPrimaryButtonClass,
} from "@/lib/calendar-header-action-styles";
import {
  canAdvanceFromStep,
  createInitialBookingState,
  getBackStep,
  getNextStep,
  PATIENT_BOOKING_DIALOG_DESC_ID,
  shouldFetchAvailabilitySlots,
  shouldShowConfirmSection,
  shouldShowScheduleSection,
  type PatientBookingAppointmentType,
  type PatientBookingStep,
  type PatientBookingWizardState,
} from "@/lib/patient-booking-wizard";
import { PatientBookingStepper } from "@/components/shared/patient-booking/PatientBookingStepper";
import { PatientBookingDoctorTypeSection } from "@/components/shared/patient-booking/PatientBookingDoctorTypeSection";
import { PatientBookingScheduleSection } from "@/components/shared/patient-booking/PatientBookingScheduleSection";
import { PatientBookingConfirmSection } from "@/components/shared/patient-booking/PatientBookingConfirmSection";
import { patientBookingDialogContentClass } from "@/components/shared/patient-booking/patient-booking-dialog-styles";
import type { User as AppUser } from "@/types/types";

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
  notes?: string;
}

function BookingSectionMotion({
  show,
  children,
}: {
  show: boolean;
  children: ReactNode;
}) {
  const reduceMotion = useReducedMotion();
  if (!show) return null;
  if (reduceMotion) return <div>{children}</div>;
  return (
    <motion.div
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
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<PatientBookingStep>(1);
  const [doctorId, setDoctorId] = useState(preselectedDoctorId ?? "");
  const [selectedType, setSelectedType] = useState<PatientBookingAppointmentType | null>(null);
  const [flexDuration, setFlexDuration] = useState(30);
  const [dateStr, setDateStr] = useState("");
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");

  const { data: usersData } = useUsers({ role: "doctor" });
  const doctors: AppUser[] = usersData?.users ?? [];

  const { data: typesData, isLoading: typesLoading } = useQuery({
    queryKey: queryKeys.appointmentTypes.byDoctor(doctorId),
    queryFn: () =>
      apiClient<{ types: PatientBookingAppointmentType[] }>(
        `/api/appointment-types?doctorId=${doctorId}`
      ),
    enabled: Boolean(doctorId),
    staleTime: 5 * 60 * 1000,
  });
  const types = typesData?.types ?? [];
  const isFlexible = !typesLoading && types.length === 0 && Boolean(doctorId);
  const effectiveTypeId = selectedType?.id ?? "";

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

  const fetchSlots = shouldFetchAvailabilitySlots(wizardState);
  const { data: slotsData, isLoading: slotsLoading } = useAvailabilitySlots(
    fetchSlots ? doctorId : null,
    fetchSlots ? dateStr : null,
    fetchSlots ? effectiveTypeId : null
  );
  const slots: string[] = slotsData?.slots ?? [];
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
    if (v && preselectedDoctorId) {
      setDoctorId(preselectedDoctorId);
    }
    if (!v) resetAll();
  }

  function handleDoctorIdChange(id: string) {
    setDoctorId(id);
    setSelectedType(null);
    setSelectedSlot(null);
    setDateStr("");
  }

  function handleDateStrChange(value: string) {
    setDateStr(value);
    setSelectedSlot(null);
  }

  function prefetchTitleForStep4() {
    if (selectedType && !title) setTitle(selectedType.name);
  }

  function handleNext() {
    if (step === 3) {
      prefetchTitleForStep4();
      setStep(4);
      return;
    }
    const next = getNextStep(step, wizardState);
    if (next === 4) prefetchTitleForStep4();
    setStep(next);
  }

  function handleBack() {
    const prev = getBackStep(step, wizardState);
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

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!doctorId || !selectedSlot || !title) return;
    const startDt = new Date(selectedSlot);
    const endDt = addMinutes(startDt, duration);
    bookMutation.mutate({
      title,
      start: startDt.toISOString(),
      end: endDt.toISOString(),
      doctorId,
      ...(notes ? { notes } : {}),
    });
  }

  const selectedDoctor = doctors.find((d) => d.id === doctorId);
  const today = new Date().toISOString().slice(0, 10);
  const backStep = getBackStep(step, wizardState);
  const canAdvance = canAdvanceFromStep(step, wizardState);
  const showSchedule = shouldShowScheduleSection(step);
  const showConfirm = shouldShowConfirmSection(step);

  const primaryLabel =
    step === 4
      ? bookMutation.isPending
        ? "Submitting…"
        : "Confirm Request"
      : step === 2 && isFlexible
        ? "Continue"
        : step === 3
          ? "Continue"
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
        aria-describedby={PATIENT_BOOKING_DIALOG_DESC_ID}
        className={patientBookingDialogContentClass}
      >
        <div className="shrink-0 bg-white pt-6 text-gray-700">
          <div className="px-6">
            <div className="flex items-start gap-2">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-sky-200/70 bg-sky-50 text-sky-700">
                <CalendarPlus className="h-5 w-5" aria-hidden />
              </span>
              <div className="min-w-0">
                <DialogTitle className="text-left text-xl font-semibold text-gray-700">
                  Request New Appointment
                </DialogTitle>
                <DialogDescription
                  id={PATIENT_BOOKING_DIALOG_DESC_ID}
                  className="text-left text-sm text-muted-foreground"
                >
                  Choose your doctor, visit type, date, time, and confirm your request.
                </DialogDescription>
              </div>
              <DialogClose asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="ml-auto h-8 w-8 shrink-0 rounded-full text-muted-foreground hover:bg-sky-100 hover:text-sky-800"
                >
                  <X className="h-4 w-4" aria-hidden />
                  <span className="sr-only">Close</span>
                </Button>
              </DialogClose>
            </div>
          </div>
          <div className="mx-6 mt-4 border-b border-sky-200/60" />
          <PatientBookingStepper step={step} />
        </div>

        <form
          id="patient-booking-form"
          onSubmit={handleSubmit}
          className="flex min-h-0 flex-1 flex-col"
        >
          <div className="min-h-0 flex-1 overflow-y-auto px-6 py-4 text-gray-700">
            <PatientBookingDoctorTypeSection
              lockDoctor={lockDoctor}
              doctors={doctors}
              selectedDoctor={selectedDoctor}
              doctorId={doctorId}
              onDoctorIdChange={handleDoctorIdChange}
              typesLoading={typesLoading}
              isFlexible={isFlexible}
              types={types}
              selectedType={selectedType}
              onSelectType={setSelectedType}
              flexDuration={flexDuration}
              onFlexDurationChange={setFlexDuration}
            />

            <BookingSectionMotion show={showSchedule}>
              <PatientBookingScheduleSection
                today={today}
                dateStr={dateStr}
                onDateStrChange={handleDateStrChange}
                selectedDoctor={selectedDoctor}
                selectedType={selectedType}
                isFlexible={isFlexible}
                flexDuration={flexDuration}
                duration={duration}
                slotsLoading={slotsLoading}
                slots={slots}
                selectedSlot={selectedSlot}
                onSelectSlot={setSelectedSlot}
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

            {step === 4 ? (
              <Button
                type="submit"
                form="patient-booking-form"
                variant="ghost"
                disabled={bookMutation.isPending || !canAdvance}
                className={cn(skyGlassPrimaryButtonClass, "cursor-pointer")}
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
