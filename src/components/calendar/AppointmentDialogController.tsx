"use client";

import React, { useEffect, useState, startTransition } from "react";
import type { Appointment } from "@/types/types";
import { FullAppointment } from "@/hooks/useAppointments";
import AppointmentDialog from "./AppointmentDialog";

type AppointmentLike = Appointment | FullAppointment;

type AppointmentDialogControllerProps = {
  trigger?: React.ReactNode;
  appointment?: AppointmentLike;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSuccess?: () => void | Promise<void>;
  openOnAppointmentChange?: boolean;
  telehealthBookingPreset?: boolean;
};

export default function AppointmentDialogController({
  trigger,
  appointment,
  isOpen,
  onOpenChange,
  onSuccess,
  openOnAppointmentChange = false,
  telehealthBookingPreset = false,
}: AppointmentDialogControllerProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = typeof isOpen === "boolean";
  const open = isControlled ? isOpen : internalOpen;

  useEffect(() => {
    if (!openOnAppointmentChange || !appointment || isControlled) return;
    startTransition(() => setInternalOpen(true));
  }, [appointment, openOnAppointmentChange, isControlled]);

  const handleOpenChange = (nextOpen: boolean) => {
    if (!isControlled) setInternalOpen(nextOpen);
    onOpenChange?.(nextOpen);
  };

  const handleSuccess = async () => {
    if (!isControlled) setInternalOpen(false);
    onOpenChange?.(false);
    await onSuccess?.();
  };

  return (
    <>
      {trigger && (
        <span onClick={() => handleOpenChange(true)} className="cursor-pointer">
          {trigger}
        </span>
      )}
      <AppointmentDialog
        isOpen={open}
        onOpenChange={handleOpenChange}
        appointment={appointment}
        onSuccess={handleSuccess}
        telehealthBookingPreset={telehealthBookingPreset}
      />
    </>
  );
}
