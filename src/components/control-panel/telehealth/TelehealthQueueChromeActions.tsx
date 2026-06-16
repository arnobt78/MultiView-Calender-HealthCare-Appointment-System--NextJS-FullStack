"use client";

import { CalendarPlus, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  bookAppointmentGlassTriggerClass,
  emeraldGlassPrimaryButtonClass,
} from "@/lib/calendar-header-action-styles";
import { BookAppointmentDialog } from "@/components/shared/patient-booking/PatientBookingDialog";
import AppointmentDialogController from "@/components/calendar/AppointmentDialogController";
import type { EntityRole } from "@/lib/entity-routes";
import { isPatientRole } from "@/lib/rbac";

type Props = {
  viewerRole: EntityRole;
};

/**
 * Telehealth queue header CTA — telehealth-only booking preset per role (REQ-0091).
 * Patient: Book Video Visit wizard. Staff: New Video Visit appointment dialog.
 */
export function TelehealthQueueChromeActions({ viewerRole }: Props) {
  if (isPatientRole(viewerRole)) {
    return (
      <BookAppointmentDialog
        telehealthOnly
        trigger={
          <Button type="button" variant="ghost" className={bookAppointmentGlassTriggerClass}>
            <Video className="h-4 w-4" aria-hidden />
            Book Video Visit
          </Button>
        }
      />
    );
  }

  return (
    <AppointmentDialogController
      telehealthBookingPreset
      trigger={
        <Button type="button" variant="ghost" size="lg" className={emeraldGlassPrimaryButtonClass}>
          <CalendarPlus className="shrink-0" aria-hidden />
          New Video Visit
        </Button>
      }
    />
  );
}
