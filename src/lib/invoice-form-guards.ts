/**
 * Pure create/edit submit guards for InvoiceFormDialog — unit-tested without RTL.
 */

import type { InvoiceAppointmentOptionRow } from "@/lib/billing-types";

export type CanSubmitCreateInvoiceInput = {
  amount: string;
  apptId: string;
  presetAppointmentId?: string;
  selection: InvoiceAppointmentOptionRow | null;
  /** When true, selection must be loaded and eligible (appointment-card preset). */
  requirePresetSelection?: boolean;
};

/** Whether create form can submit — mirrors InvoiceFormDialogInner rules. */
export function canSubmitCreateInvoice(input: CanSubmitCreateInvoiceInput): boolean {
  const parsed = parseFloat(input.amount);
  if (!parsed || parsed <= 0) return false;

  const linkedAppt = (input.apptId.trim() || input.presetAppointmentId || "").trim();
  if (!linkedAppt) return false;

  if (input.requirePresetSelection) {
    return Boolean(input.selection?.eligible);
  }

  if (input.selection && !input.selection.eligible) return false;
  return true;
}

export type BuildInvoiceCreateBodyInput = {
  amount: string;
  description: string;
  dueDate: string;
  apptId: string;
  presetAppointmentId?: string;
};

export function buildInvoiceCreateBody(input: BuildInvoiceCreateBodyInput) {
  const parsed = parseFloat(input.amount);
  const linkedAppt = (input.apptId.trim() || input.presetAppointmentId || "").trim();
  return {
    amount: parsed,
    description: input.description.trim() || undefined,
    due_date: input.dueDate.trim() || undefined,
    appointment_id: linkedAppt,
  };
}

export function buildInvoiceUpdateBody(description: string, dueDate: string) {
  return {
    description: description.trim() || undefined,
    due_date: dueDate.trim() || null,
  };
}

/** Suggested amount in EUR string from cents — used when preset/picker loads. */
export function formatSuggestedAmountEur(cents: number | null | undefined): string {
  if (!cents || cents <= 0) return "";
  return (cents / 100).toFixed(2);
}
