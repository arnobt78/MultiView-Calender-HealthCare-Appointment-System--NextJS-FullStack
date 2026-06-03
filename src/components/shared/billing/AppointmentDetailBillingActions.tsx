"use client";

import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { useInvoiceFormDialogOptional } from "@/context/InvoiceFormDialogContext";
import { useInvoiceFormDialogController } from "@/hooks/useInvoiceFormDialogController";
import { useInitialNavRole } from "@/context/NavRoleContext";
import { useAuth } from "@/hooks/useAuth";
import { useAppointmentInvoiceDisplayMap } from "@/hooks/useAppointmentInvoiceDisplayMap";
import { canShowCreateInvoiceAction } from "@/lib/appointment-invoice-create-eligibility";
import { billingCreateInvoiceTriggerDefault } from "@/lib/billing-ui-presets";
import { isAdminRole, isDoctorRole } from "@/lib/rbac";

type Props = {
  appointmentId: string;
};

/**
 * Appointment detail header — opens preset invoice create when staff + visit eligible.
 * Falls back to local dialog when route is outside InvoiceFormDialogProvider.
 */
export function AppointmentDetailBillingActions({ appointmentId }: Props) {
  const { user } = useAuth();
  const navRole = useInitialNavRole();
  const role = user?.role ?? navRole;
  const invoiceMap = useAppointmentInvoiceDisplayMap([appointmentId]);
  const invoiceDisplayStatus = invoiceMap.get(appointmentId) ?? null;
  const ctx = useInvoiceFormDialogOptional();
  const local = useInvoiceFormDialogController({
    variant: isAdminRole(role) ? "admin" : "doctor",
  });
  const { openCreateForAppointment, dialogNode } = ctx ?? local;

  const show = useMemo(
    () =>
      canShowCreateInvoiceAction({ role, invoiceDisplayStatus }) &&
      (isAdminRole(role) || isDoctorRole(role)),
    [role, invoiceDisplayStatus]
  );

  if (!show) return null;

  const TriggerIcon = billingCreateInvoiceTriggerDefault.triggerIcon;

  return (
    <>
      <Button
        type="button"
        size="sm"
        className={billingCreateInvoiceTriggerDefault.triggerClassName}
        onClick={() => openCreateForAppointment(appointmentId)}
      >
        <TriggerIcon className="h-4 w-4" aria-hidden />
        {billingCreateInvoiceTriggerDefault.triggerLabel}
      </Button>
      {!ctx ? dialogNode : null}
    </>
  );
}
