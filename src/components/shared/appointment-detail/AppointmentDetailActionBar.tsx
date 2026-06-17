"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Pencil,
  Printer,
  Receipt,
  Trash2,
  Ban,
  Calendar,
} from "lucide-react";
import { EntityDetailFooterRow } from "@/components/shared/entity-detail/EntityDetailFooterRow";
import { ControlPanelGlassActionButton } from "@/components/shared/ControlPanelGlassActionButton";
import { ConfirmActionDialog } from "@/components/shared/ConfirmActionDialog";
import { useAuth } from "@/hooks/useAuth";
import { useGoogleCalendarSyncOptional } from "@/context/GoogleCalendarSyncContext";
import { useAppointments } from "@/hooks/useAppointments";
import { useInvoiceFormDialogOptional } from "@/context/InvoiceFormDialogContext";
import { useInvoiceFormDialogController } from "@/hooks/useInvoiceFormDialogController";
import { useAppointmentInvoiceDisplayMap } from "@/hooks/useAppointmentInvoiceDisplayMap";
import { useInitialNavRole } from "@/context/NavRoleContext";
import { getAppointmentMenuCapabilities } from "@/lib/appointment-menu-permissions";
import { canShowCreateInvoiceAction } from "@/lib/appointment-invoice-create-eligibility";
import { resolveInvoiceDetailActionCapabilities } from "@/lib/invoice-detail-action-capabilities";
import {
  buildAppointmentDeleteConfirmSubtitle,
  DELETE_APPOINTMENT_CONFIRM_TITLE,
} from "@/lib/confirm-delete-dialog-copy";
import { billingCreateInvoiceTriggerDefault } from "@/lib/billing-ui-presets";
import { cn } from "@/lib/utils";
import { isAdminRole, isDoctorRole } from "@/lib/rbac";
import type { AppointmentDetailToneClasses } from "@/lib/appointment-detail-ui-classes";
import type { Appointment } from "@/types/types";
import type { AppointmentAssignee } from "@/types/types";
import type { Invoice } from "@/hooks/usePayments";

type Props = {
  appointment: Appointment;
  assignees: AppointmentAssignee[];
  linkedInvoices: Invoice[];
  backHref: string;
  backLabel: string;
  toneClasses: AppointmentDetailToneClasses;
  canEdit: boolean;
  listHref: string;
  /** Opens shared `AppointmentDialog` edit mode (entity-detail pattern). */
  onEditClick?: () => void;
};

/**
 * Footer actions — Print, Update Visit, billing, GCal, cancel/delete.
 * Video + Mark done live in `AppointmentDetailHeaderQuickActions`.
 */
export function AppointmentDetailActionBar({
  appointment,
  assignees,
  linkedInvoices,
  backHref,
  backLabel,
  toneClasses,
  canEdit,
  listHref,
  onEditClick,
}: Props) {
  const router = useRouter();
  const { user } = useAuth();
  const { isConnected: isGoogleConnected, syncToGoogle, syncingAppointmentId } =
    useGoogleCalendarSyncOptional();
  const navRole = useInitialNavRole();
  const role = user?.role ?? navRole;
  const viewerRole = isAdminRole(role) ? "admin" : "doctor";
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const {
    cancelAppointmentAsync,
    isCancelling,
    deleteAppointmentAsync,
    isDeleting,
    isTogglingStatus,
  } = useAppointments();
  const invoiceMap = useAppointmentInvoiceDisplayMap([appointment.id]);
  const invoiceDisplayStatus = invoiceMap.get(appointment.id) ?? null;
  const ctx = useInvoiceFormDialogOptional();
  const local = useInvoiceFormDialogController({
    variant: isAdminRole(role) ? "admin" : "doctor",
  });
  const { openCreateForAppointment, openEdit, dialogNode } = ctx ?? local;

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

  const editableLinkedInvoice = useMemo(() => {
    if (showCreateInvoice || linkedInvoices.length === 0) return null;
    const primary = linkedInvoices[0];
    const caps = resolveInvoiceDetailActionCapabilities(primary, viewerRole, {
      viewerUserId: user?.id,
    });
    return caps.canEditDetails ? primary : null;
  }, [showCreateInvoice, linkedInvoices, viewerRole, user?.id]);

  const isCancelled = appointment.status === "cancelled";
  const busy = isTogglingStatus || isDeleting || isCancelling;
  const isSyncingGoogle = syncingAppointmentId === appointment.id;
  const updateVariant = toneClasses.footerPrimaryVariant;

  return (
    <>
      <EntityDetailFooterRow
        backHref={backHref}
        backButtonClassName={cn(toneClasses.backButtonClass, "no-underline")}
        backLabel={backLabel}
        actions={
          <>
            {canEdit && !isCancelled ? (
              <ControlPanelGlassActionButton
                type="button"
                variant="sky"
                onClick={() => window.print()}
              >
                <Printer className="shrink-0" aria-hidden />
                Print
              </ControlPanelGlassActionButton>
            ) : null}
            {canEdit && capabilities.canEdit && !isCancelled ? (
              <ControlPanelGlassActionButton
                type="button"
                variant={updateVariant}
                disabled={busy}
                onClick={() => onEditClick?.()}
              >
                <Pencil className="shrink-0" aria-hidden />
                Update Visit
              </ControlPanelGlassActionButton>
            ) : null}
            {canEdit && isGoogleConnected && !isCancelled ? (
              <ControlPanelGlassActionButton
                type="button"
                variant="sky"
                disabled={busy || isSyncingGoogle}
                onClick={() => syncToGoogle(appointment.id)}
              >
                <Calendar className="shrink-0" aria-hidden />
                {isSyncingGoogle ? "Syncing…" : "Sync to Google Calendar"}
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
            {editableLinkedInvoice ? (
              <ControlPanelGlassActionButton
                type="button"
                variant="violet"
                onClick={() => openEdit(editableLinkedInvoice)}
              >
                <Pencil className="shrink-0" aria-hidden />
                Edit Invoice
              </ControlPanelGlassActionButton>
            ) : null}
            {canEdit && capabilities.canCancel ? (
              <ConfirmActionDialog
                open={cancelOpen}
                onOpenChange={setCancelOpen}
                variant="warning"
                title="Cancel appointment?"
                subtitle="This visit will be marked cancelled. Stakeholders will be notified."
                confirmLabel="Cancel Appointment"
                confirmPending={isCancelling}
                confirmPendingLabel="Cancelling…"
                onConfirm={async () => {
                  await cancelAppointmentAsync(appointment.id);
                  setCancelOpen(false);
                }}
                trigger={
                  <ControlPanelGlassActionButton
                    type="button"
                    variant="sky"
                    disabled={busy}
                  >
                    <Ban className="shrink-0" aria-hidden />
                    {isCancelling ? "Cancelling…" : "Cancel Appointment"}
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
                confirmPending={isDeleting}
                confirmPendingLabel="Deleting…"
                onConfirm={async () => {
                  await deleteAppointmentAsync(appointment.id);
                  setDeleteOpen(false);
                  router.push(listHref);
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
          </>
        }
      />
      {!ctx ? dialogNode : null}
    </>
  );
}
