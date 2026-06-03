"use client";

import { useCallback, useMemo, useState } from "react";
import { InvoiceFormDialog } from "@/components/shared/billing/invoice-dialog";
import type {
  InvoiceCreateBody,
  InvoiceUpdateBody,
} from "@/components/shared/billing/invoice-dialog";
import { usePayments, type Invoice } from "@/hooks/usePayments";
import { useInitialNavRole } from "@/context/NavRoleContext";
import { isAdminRole } from "@/lib/rbac";

export type InvoiceFormDialogVariant = "admin" | "doctor";

export type UseInvoiceFormDialogControllerOptions = {
  /** Override variant — defaults from nav role (admin vs doctor). */
  variant?: InvoiceFormDialogVariant;
};

/**
 * Shared create/edit invoice dialog state — used by list pages, detail, calendar surfaces.
 * Mutations invalidate via usePayments → invalidateAfterInvoiceWrite (invoices + billing picker).
 */
export function useInvoiceFormDialogController(
  opts?: UseInvoiceFormDialogControllerOptions
) {
  const navRole = useInitialNavRole();
  const variant: InvoiceFormDialogVariant =
    opts?.variant ?? (isAdminRole(navRole) ? "admin" : "doctor");

  const {
    createInvoice,
    updateInvoice,
    isCreating,
    isUpdating,
  } = usePayments();

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

  const openCreateForAppointment = useCallback((appointmentId: string) => {
    setDialogMode("create");
    setEditTarget(null);
    setPresetAppointmentId(appointmentId);
    setFormSession((s) => s + 1);
    setDialogOpen(true);
  }, []);

  const openEdit = useCallback((invoice: Invoice) => {
    setDialogMode("edit");
    setEditTarget(invoice);
    setPresetAppointmentId(undefined);
    setFormSession((s) => s + 1);
    setDialogOpen(true);
  }, []);

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
