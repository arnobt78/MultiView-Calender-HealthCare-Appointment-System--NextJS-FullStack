"use client";

import { useState } from "react";
import type { LucideIcon } from "lucide-react";
import { FileEdit, Loader2, Pencil, Receipt, Save, X } from "lucide-react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { InvoiceDialogFieldsSection } from "@/components/shared/billing/invoice-dialog/InvoiceDialogFieldsSection";
import { InvoiceDialogVisitSection } from "@/components/shared/billing/invoice-dialog/InvoiceDialogVisitSection";
import type { InvoiceRow } from "@/lib/billing-types";
import type { InvoiceAppointmentOptionRow } from "@/lib/billing-types";
import {
  invoiceDialogGlassBackButtonClass,
  invoiceDialogShellClass,
} from "@/lib/invoice-dialog-ui-classes";
import { amberGlassPrimaryButtonClass } from "@/lib/calendar-header-action-styles";
import { cn, toTitleCaseLabel } from "@/lib/utils";
import {
  buildInvoiceCreateBody,
  buildInvoiceUpdateBody,
  canSubmitCreateInvoice,
  formatSuggestedAmountEur,
} from "@/lib/invoice-form-guards";

export type InvoiceCreateBody = {
  amount: number;
  description?: string;
  due_date?: string;
  appointment_id: string;
};

export type InvoiceUpdateBody = {
  description?: string;
  due_date?: string | null;
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  variant: "admin" | "doctor";
  onCreate?: (body: InvoiceCreateBody) => void;
  onUpdate?: (body: InvoiceUpdateBody) => void;
  appointmentId?: string;
  editInvoice?: Pick<
    InvoiceRow,
    "id" | "amount" | "currency" | "description" | "due_date" | "visit_summary"
  >;
  isSubmitting?: boolean;
  /** Increment when parent opens dialog — remounts inner form with fresh defaults. */
  formSession?: number;
  trigger?: React.ReactNode;
};

type InnerProps = Omit<Props, "open" | "onOpenChange" | "trigger" | "formSession"> & {
  onClose: () => void;
};

function InvoiceFormDialogInner({
  mode,
  variant,
  onCreate,
  onUpdate,
  appointmentId,
  editInvoice,
  isSubmitting = false,
  onClose,
}: InnerProps) {
  const isEdit = mode === "edit";
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState(
    () => (isEdit ? editInvoice?.description : "") ?? ""
  );
  const [dueDate, setDueDate] = useState(
    () => (isEdit ? editInvoice?.due_date?.slice(0, 10) : "") ?? ""
  );
  const [apptId, setApptId] = useState(
    () =>
      (isEdit ? editInvoice?.visit_summary?.appointment_id : appointmentId) ?? ""
  );
  const [includeBilled, setIncludeBilled] = useState(false);
  const [selection, setSelection] = useState<InvoiceAppointmentOptionRow | null>(null);

  function handleSelectionChange(option: InvoiceAppointmentOptionRow | null) {
    setSelection(option);
    const suggested = option?.suggested_amount_cents ?? 0;
    const formatted = formatSuggestedAmountEur(suggested);
    if (formatted) setAmount(formatted);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isSubmitting) return;

    if (isEdit && editInvoice && onUpdate) {
      onUpdate(buildInvoiceUpdateBody(description, dueDate));
      return;
    }

    if (
      !canSubmitCreateInvoice({
        amount,
        apptId,
        presetAppointmentId: appointmentId,
        selection,
        requirePresetSelection: Boolean(appointmentId),
      })
    ) {
      return;
    }

    onCreate?.(buildInvoiceCreateBody({ amount, description, dueDate, apptId, presetAppointmentId: appointmentId }));
  }

  const HeaderIcon: LucideIcon = isEdit ? Pencil : Receipt;
  const SubmitIcon: LucideIcon = isEdit ? Save : FileEdit;
  const canSubmitCreate = canSubmitCreateInvoice({
    amount,
    apptId,
    presetAppointmentId: appointmentId,
    selection,
    requirePresetSelection: Boolean(appointmentId),
  });
  const canSubmit = isEdit ? !isSubmitting : canSubmitCreate && !isSubmitting;

  return (
    <>
      <div className="shrink-0 bg-white pt-6 text-gray-700">
        <div className="px-6">
          <div className="flex items-start gap-2">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-amber-200/70 bg-amber-50 text-amber-700">
              <HeaderIcon className="h-5 w-5" aria-hidden />
            </span>
            <div className="min-w-0">
              <DialogTitle className="text-left text-xl font-semibold text-gray-700">
                {isEdit
                  ? toTitleCaseLabel("Edit Invoice")
                  : toTitleCaseLabel("Create Invoice")}
              </DialogTitle>
              <DialogDescription className="text-left text-sm text-muted-foreground">
                {isEdit
                  ? toTitleCaseLabel(
                      "Update description and due date. Amount and linked visit are fixed after create."
                    )
                  : variant === "admin"
                    ? toTitleCaseLabel(
                        "Pick a visit, set amount and due date, then save as draft."
                      )
                    : toTitleCaseLabel(
                        "Draft a bill for an eligible visit in your panel."
                      )}
              </DialogDescription>
            </div>
            <DialogClose asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="ml-auto h-8 w-8 shrink-0 rounded-full text-muted-foreground hover:bg-amber-100 hover:text-amber-800"
              >
                <X className="h-4 w-4" aria-hidden />
                <span className="sr-only">Close</span>
              </Button>
            </DialogClose>
          </div>
        </div>
        <div className="mx-6 mt-4 border-b border-amber-200/60" />
      </div>

      <form
        onSubmit={handleSubmit}
        className="flex min-h-0 flex-1 flex-col overflow-hidden"
      >
        <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-6 py-4 text-gray-700">
          <InvoiceDialogVisitSection
            variant={variant}
            mode={mode}
            appointmentId={appointmentId}
            apptId={apptId}
            onApptIdChange={setApptId}
            onSelectionChange={handleSelectionChange}
            selection={selection}
            includeBilled={includeBilled}
            onIncludeBilledChange={
              variant === "admin" && !isEdit ? setIncludeBilled : undefined
            }
            visitSummary={editInvoice?.visit_summary}
            disabled={isSubmitting}
          />
          <InvoiceDialogFieldsSection
            mode={mode}
            amount={amount}
            onAmountChange={setAmount}
            description={description}
            onDescriptionChange={setDescription}
            dueDate={dueDate}
            onDueDateChange={setDueDate}
            readOnlyAmountCents={isEdit ? editInvoice?.amount : undefined}
            readOnlyCurrency={editInvoice?.currency}
            suggestedAmountCents={selection?.suggested_amount_cents}
            visitFeeHintInput={
              selection
                ? {
                    typePriceCents: selection.appointment_type_price_cents,
                    doctorConsultationFeeCents: selection.doctor_consultation_fee_cents,
                  }
                : null
            }
            disabled={isSubmitting}
          />
        </div>

        <div className="flex shrink-0 flex-wrap justify-end gap-2 border-t border-amber-200/60 bg-amber-50/40 px-6 py-3">
          <Button
            type="button"
            variant="ghost"
            className={invoiceDialogGlassBackButtonClass}
            disabled={isSubmitting}
            onClick={onClose}
          >
            <X className="h-4 w-4" aria-hidden />
            Cancel
          </Button>
          <Button
            type="submit"
            className={cn(amberGlassPrimaryButtonClass)}
            disabled={!canSubmit}
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            ) : (
              <SubmitIcon className="h-4 w-4" aria-hidden />
            )}
            {isSubmitting
              ? isEdit
                ? "Saving…"
                : "Creating…"
              : isEdit
                ? toTitleCaseLabel("Save Changes")
                : toTitleCaseLabel("Create Draft")}
          </Button>
        </div>
      </form>
    </>
  );
}

/**
 * Create/Edit invoice — amber glass shell aligned with patient/appointment dialogs.
 * Parent owns open state + mutations (`InvoiceManagement`, `DoctorPortalInvoicesCard`).
 */
export function InvoiceFormDialog({
  open,
  onOpenChange,
  formSession = 0,
  trigger,
  ...innerProps
}: Props) {
  return (
    <>
      {trigger}
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent showCloseButton={false} className={invoiceDialogShellClass}>
          <InvoiceFormDialogInner
            key={formSession}
            {...innerProps}
            onClose={() => onOpenChange(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
