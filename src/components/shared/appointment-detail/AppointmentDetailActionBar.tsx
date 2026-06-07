"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle,
  Circle,
  List,
  Pencil,
  Receipt,
  Trash2,
  Ban,
} from "lucide-react";
import { BackNavigationLink } from "@/components/shared/BackNavigationLink";
import { ControlPanelGlassActionButton } from "@/components/shared/ControlPanelGlassActionButton";
import { ConfirmActionDialog } from "@/components/shared/ConfirmActionDialog";
import { useAuth } from "@/hooks/useAuth";
import { useAppointments } from "@/hooks/useAppointments";
import { useInvoiceFormDialogOptional } from "@/context/InvoiceFormDialogContext";
import { useInvoiceFormDialogController } from "@/hooks/useInvoiceFormDialogController";
import { useAppointmentInvoiceDisplayMap } from "@/hooks/useAppointmentInvoiceDisplayMap";
import { useInitialNavRole } from "@/context/NavRoleContext";
import { getAppointmentMenuCapabilities } from "@/lib/appointment-menu-permissions";
import { canShowCreateInvoiceAction } from "@/lib/appointment-invoice-create-eligibility";
import {
  buildAppointmentDeleteConfirmSubtitle,
  DELETE_APPOINTMENT_CONFIRM_TITLE,
} from "@/lib/confirm-delete-dialog-copy";
import { billingCreateInvoiceTriggerDefault } from "@/lib/billing-ui-presets";
import { isAdminRole, isDoctorRole } from "@/lib/rbac";
import type { AppointmentDetailToneClasses } from "@/lib/appointment-detail-ui-classes";
import type { Appointment } from "@/types/types";
import type { AppointmentAssignee } from "@/types/types";

type Props = {
  appointment: Appointment;
  assignees: AppointmentAssignee[];
  backHref: string;
  backLabel: string;
  toneClasses: AppointmentDetailToneClasses;
  canEdit: boolean;
  listHref: string;
};

/**
 * Footer actions — mirrors calendar ⋮ menu (toggle status, edit, delete, create invoice).
 */
export function AppointmentDetailActionBar({
  appointment,
  assignees,
  backHref,
  backLabel,
  toneClasses,
  canEdit,
  listHref,
}: Props) {
  const router = useRouter();
  const { user } = useAuth();
  const navRole = useInitialNavRole();
  const role = user?.role ?? navRole;
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const {
    toggleStatus,
    isTogglingStatus,
    deleteAppointment,
    isDeleting,
    cancelAppointment,
    isCancelling,
  } = useAppointments();
  const invoiceMap = useAppointmentInvoiceDisplayMap([appointment.id]);
  const invoiceDisplayStatus = invoiceMap.get(appointment.id) ?? null;
  const ctx = useInvoiceFormDialogOptional();
  const local = useInvoiceFormDialogController({
    variant: isAdminRole(role) ? "admin" : "doctor",
  });
  const { openCreateForAppointment, dialogNode } = ctx ?? local;

  const capabilities = useMemo(
    () =>
      getAppointmentMenuCapabilities({
        appointment,
        assignees,
        userId: user?.id,
        userEmail: user?.email,
        userRole: role,
      }),
    [appointment, assignees, user?.id, user?.email, role]
  );

  const showCreateInvoice = useMemo(
    () =>
      canShowCreateInvoiceAction({ role, invoiceDisplayStatus }) &&
      (isAdminRole(role) || isDoctorRole(role)),
    [role, invoiceDisplayStatus]
  );

  const isDone = appointment.status === "done";
  const isCancelled = appointment.status === "cancelled";
  const busy = isTogglingStatus || isDeleting || isCancelling;

  const scrollToEdit = () => {
    document.getElementById("appointment-detail-edit")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <div className={toneClasses.stickyFooterClass}>
        <BackNavigationLink href={backHref} className={toneClasses.backButtonClass}>
          <List className="shrink-0" aria-hidden />
          {backLabel}
        </BackNavigationLink>
        <div className="flex flex-wrap gap-2">
          {canEdit && capabilities.canToggleStatus && !isCancelled ? (
            <ControlPanelGlassActionButton
              type="button"
              variant={isDone ? "sky" : "emerald"}
              disabled={busy}
              onClick={() =>
                toggleStatus({
                  id: appointment.id,
                  status: isDone ? "pending" : "done",
                })
              }
            >
              {isDone ? (
                <Circle className="shrink-0" aria-hidden />
              ) : (
                <CheckCircle className="shrink-0" aria-hidden />
              )}
              {isDone ? "Mark open" : "Mark done"}
            </ControlPanelGlassActionButton>
          ) : null}
          {canEdit && capabilities.canEdit && !isCancelled ? (
            <ControlPanelGlassActionButton
              type="button"
              variant="emerald"
              disabled={busy}
              onClick={scrollToEdit}
            >
              <Pencil className="shrink-0" aria-hidden />
              Update
            </ControlPanelGlassActionButton>
          ) : null}
          {showCreateInvoice ? (
            <ControlPanelGlassActionButton
              type="button"
              variant="violet"
              onClick={() => openCreateForAppointment(appointment.id)}
            >
              <Receipt className="shrink-0" aria-hidden />
              {billingCreateInvoiceTriggerDefault.triggerLabel}
            </ControlPanelGlassActionButton>
          ) : null}
          {canEdit && capabilities.canCancel ? (
            <ConfirmActionDialog
              open={cancelOpen}
              onOpenChange={setCancelOpen}
              variant="warning"
              title="Cancel appointment?"
              subtitle="This visit will be marked cancelled. Stakeholders will be notified."
              confirmLabel="Cancel visit"
              onConfirm={() => {
                cancelAppointment(appointment.id);
              }}
              trigger={
                <ControlPanelGlassActionButton
                  type="button"
                  variant="sky"
                  disabled={busy}
                >
                  <Ban className="shrink-0" aria-hidden />
                  {isCancelling ? "Cancelling…" : "Cancel visit"}
                </ControlPanelGlassActionButton>
              }
            />
          ) : null}
          {canEdit && capabilities.canDelete ? (
            <ConfirmActionDialog
              open={deleteOpen}
              onOpenChange={setDeleteOpen}
              variant="destructive"
              title={DELETE_APPOINTMENT_CONFIRM_TITLE}
              subtitle={buildAppointmentDeleteConfirmSubtitle(appointment.title ?? "", "detail")}
              confirmLabel="Delete"
              onConfirm={() => {
                deleteAppointment(appointment.id, {
                  onSuccess: () => router.push(listHref),
                });
              }}
              trigger={
                <ControlPanelGlassActionButton
                  type="button"
                  variant="rose"
                  disabled={busy}
                >
                  <Trash2 className="shrink-0" aria-hidden />
                  {isDeleting ? "Deleting…" : "Delete"}
                </ControlPanelGlassActionButton>
              }
            />
          ) : null}
        </div>
      </div>
      {!ctx ? dialogNode : null}
    </>
  );
}
