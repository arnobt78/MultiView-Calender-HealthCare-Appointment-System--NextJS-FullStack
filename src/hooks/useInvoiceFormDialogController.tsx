"use client";

import { useCallback, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { InvoiceFormDialog } from "@/components/shared/billing/invoice-dialog";
import type {
  InvoiceCreateBody,
  InvoiceUpdateBody,
} from "@/components/shared/billing/invoice-dialog";
import { usePayments, type Invoice } from "@/hooks/usePayments";
import type { FullAppointment } from "@/hooks/useAppointments";
import { useAuth } from "@/hooks/useAuth";
import { useInitialNavRole } from "@/context/NavRoleContext";
import { isAdminRole } from "@/lib/rbac";
import { queryKeys } from "@/lib/query-keys";
import { seedBillingAppointmentOptionsCache } from "@/lib/billing-appointment-options-cache";
import { mapFullAppointmentToBillingOption } from "@/lib/billing-appointment-option-from-calendar";
import { filterInvoicesForAppointment } from "@/lib/invoice-entity-list-filters";

export type InvoiceFormDialogVariant = "admin" | "doctor";

export type UseInvoiceFormDialogControllerOptions = {
  /** Override variant — defaults from nav role (admin vs doctor). */
  variant?: InvoiceFormDialogVariant;
  /** SSR/layout seed for invoices.all — shared with ClinicianInvoiceDialogShell. */
  invoicesInitialData?: Invoice[];
};

/**
 * Shared create/edit invoice dialog state — used by list pages, detail, calendar surfaces.
 * Mutations invalidate via usePayments → syncAfterInvoiceWrite (cache merge + billing picker sync).
 */
export function useInvoiceFormDialogController(
  opts?: UseInvoiceFormDialogControllerOptions
) {
  const queryClient = useQueryClient();
  const { user: authUser } = useAuth();
  const navRole = useInitialNavRole();
  const variant: InvoiceFormDialogVariant =
    opts?.variant ?? (isAdminRole(navRole) ? "admin" : "doctor");

  const {
    createInvoice,
    updateInvoice,
    isCreating,
    isUpdating,
    invoices,
  } = usePayments({ invoicesInitialData: opts?.invoicesInitialData });

  const seedPresetVisitFromCalendarCache = useCallback(
    (appointmentId: string) => {
      const appointments = queryClient.getQueryData<FullAppointment[]>(
        queryKeys.appointments.all
      );
      const appt = appointments?.find((row) => row.id === appointmentId);
      if (!appt) return;
      const linked = filterInvoicesForAppointment(invoices, appointmentId);
      const currentUser =
        authUser?.id && authUser.email
          ? {
              id: authUser.id,
              email: authUser.email,
              display_name: authUser.display_name ?? null,
              image: authUser.image ?? null,
              specialty: null,
            }
          : null;
      const option = mapFullAppointmentToBillingOption(appt, linked, {
        queryClient,
        currentUser,
      });
      seedBillingAppointmentOptionsCache(queryClient, appointmentId, false, {
        options: [option],
      });
    },
    [queryClient, invoices, authUser]
  );

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"create" | "edit">("create");
  const [editTarget, setEditTarget] = useState<Invoice | null>(null);
  const [presetAppointmentId, setPresetAppointmentId] = useState<string | undefined>();
  const [formSession, setFormSession] = useState(0);

  const openCreate = useCallback(() => {
    setDialogMode("create");
    setEditTarget(null);
    setPresetAppointmentId(undefined);
    setFormSession((s) => s + 1);
    setDialogOpen(true);
  }, []);

  const openCreateForAppointment = useCallback(
    (appointmentId: string) => {
      seedPresetVisitFromCalendarCache(appointmentId);
      setDialogMode("create");
      setEditTarget(null);
      setPresetAppointmentId(appointmentId);
      setFormSession((s) => s + 1);
      setDialogOpen(true);
    },
    [seedPresetVisitFromCalendarCache]
  );

  const openEdit = useCallback(
    (invoice: Invoice) => {
      const fresh = invoices.find((row) => row.id === invoice.id) ?? invoice;
      setDialogMode("edit");
      setEditTarget(fresh);
      setPresetAppointmentId(undefined);
      setFormSession((s) => s + 1);
      setDialogOpen(true);
    },
    [invoices]
  );

  const close = useCallback(() => setDialogOpen(false), []);

  const handleCreate = useCallback(
    (body: InvoiceCreateBody) => {
      createInvoice(body, { onSuccess: () => setDialogOpen(false) });
    },
    [createInvoice]
  );

  const handleUpdate = useCallback(
    (body: InvoiceUpdateBody) => {
      if (!editTarget) return;
      updateInvoice(
        { invoiceId: editTarget.id, body },
        { onSuccess: () => setDialogOpen(false) }
      );
    },
    [editTarget, updateInvoice]
  );

  const dialogNode = useMemo(
    () => (
      <InvoiceFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        formSession={formSession}
        mode={dialogMode}
        variant={variant}
        appointmentId={presetAppointmentId}
        editInvoice={editTarget ?? undefined}
        isSubmitting={isCreating || isUpdating}
        onCreate={dialogMode === "create" ? handleCreate : undefined}
        onUpdate={dialogMode === "edit" ? handleUpdate : undefined}
      />
    ),
    [
      dialogOpen,
      formSession,
      dialogMode,
      variant,
      presetAppointmentId,
      editTarget,
      isCreating,
      isUpdating,
      handleCreate,
      handleUpdate,
    ]
  );

  return {
    dialogOpen,
    dialogMode,
    editTarget,
    presetAppointmentId,
    variant,
    openCreate,
    openCreateForAppointment,
    openEdit,
    close,
    dialogNode,
    isSubmitting: isCreating || isUpdating,
  };
}
