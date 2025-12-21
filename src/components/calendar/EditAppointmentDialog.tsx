import AppointmentDialog from "./AppointmentDialog";
import { useState } from "react";
import type { Appointment } from "../../types/types";

interface EditAppointmentDialogProps {
  appointment: Appointment;
  onSuccess: () => void;
  trigger?: React.ReactNode;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  refreshAppointments: () => void;
}

export default function EditAppointmentDialog({
  appointment,
  onSuccess,
  trigger,
  isOpen,
  onOpenChange,
  refreshAppointments,
}: EditAppointmentDialogProps) {
  // Handler to refetch appointments and close dialog
  const handleSuccess = async () => {
    if (onSuccess) onSuccess();
    if (refreshAppointments) await refreshAppointments();
    // Refetch appointments after edit
    await refreshAppointments();
  };

  return (
    <AppointmentDialog
      appointment={appointment}
      onSuccess={handleSuccess}
      trigger={trigger}
      isOpen={isOpen}
      onOpenChange={onOpenChange}
    />
  );
}
