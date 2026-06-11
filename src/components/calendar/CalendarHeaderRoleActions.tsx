"use client";

/**
 * Dashboard header primary actions — mutually exclusive by role.
 * Patients: `BookAppointmentDialog` (sky). Staff: Import .ics + New Appointment (violet/emerald).
 * Parent passes `isPatient` from SSR `initialNavRole` + `useAuth` so the correct slot paints on refresh.
 */

import { CalendarPlus, FileUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  bookAppointmentGlassTriggerClass,
  emeraldGlassPrimaryButtonClass,
  violetGlassImportButtonClass,
} from "@/lib/calendar-header-action-styles";
import { BookAppointmentDialog } from "@/components/shared/patient-booking/PatientBookingDialog";
import AppointmentDialogController from "@/components/calendar/AppointmentDialogController";
import ImportICSDialog from "@/components/calendar/ImportICSDialog";

export type CalendarHeaderRoleActionsProps = {
  isPatient: boolean;
  isComposeOpen: boolean;
  shouldComposeOpen: boolean;
  onComposeOpenChange: (open: boolean) => void;
};

export function CalendarHeaderRoleActions({
  isPatient,
  isComposeOpen,
  shouldComposeOpen,
  onComposeOpenChange,
}: CalendarHeaderRoleActionsProps) {
  if (isPatient) {
    return (
      <BookAppointmentDialog
        trigger={
          <Button type="button" variant="ghost" className={bookAppointmentGlassTriggerClass}>
            <CalendarPlus className="h-4 w-4" aria-hidden />
            Book Appointment
          </Button>
        }
      />
    );
  }

  return (
    <>
      <ImportICSDialog
        trigger={
          <Button
            type="button"
            variant="ghost"
            size="lg"
            className={violetGlassImportButtonClass}
          >
            <FileUp className="shrink-0" aria-hidden />
            Import .ics
          </Button>
        }
      />
      <AppointmentDialogController
        isOpen={shouldComposeOpen || isComposeOpen}
        onOpenChange={onComposeOpenChange}
        trigger={
          <Button
            type="button"
            variant="ghost"
            size="lg"
            className={emeraldGlassPrimaryButtonClass}
          >
            <CalendarPlus className="shrink-0" aria-hidden />
            New Appointment
          </Button>
        }
      />
    </>
  );
}
