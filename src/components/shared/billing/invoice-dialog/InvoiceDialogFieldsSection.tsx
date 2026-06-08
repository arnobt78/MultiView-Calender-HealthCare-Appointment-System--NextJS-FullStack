"use client";

import { CalendarDays, Euro, FileText } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { InvoiceDialogFieldLabel } from "@/components/shared/billing/invoice-dialog/InvoiceDialogFieldLabel";
import { InvoiceAmountDisplay } from "@/components/shared/billing/InvoiceAmountDisplay";
import { ClinicalGlassDatePicker } from "@/components/shared/scheduling/ClinicalGlassDatePicker";
import {
  invoiceDialogGlassInputClass,
  invoiceDialogGlassTextareaClass,
  invoiceDialogSectionHeadingClass,
} from "@/lib/invoice-dialog-ui-classes";
import { cn } from "@/lib/utils";
import {
  buildInvoiceAmountFeeHint,
  type VisitFeeInput,
} from "@/lib/appointment-visit-fee-display";

type Props = {
  mode: "create" | "edit";
  amount: string;
  onAmountChange: (value: string) => void;
  description: string;
  onDescriptionChange: (value: string) => void;
  dueDate: string;
  onDueDateChange: (value: string) => void;
  /** Edit mode — show stored cents read-only. */
  readOnlyAmountCents?: number;
  readOnlyCurrency?: string;
  suggestedAmountCents?: number | null;
  visitFeeHintInput?: VisitFeeInput | null;
  disabled?: boolean;
};

/** Amount, description, due date — violet glass inputs. */
export function InvoiceDialogFieldsSection({
  mode,
  amount,
  onAmountChange,
  description,
  onDescriptionChange,
  dueDate,
  onDueDateChange,
  readOnlyAmountCents,
  readOnlyCurrency = "eur",
  suggestedAmountCents,
  visitFeeHintInput,
  disabled = false,
}: Props) {
  const isEdit = mode === "edit";

  return (
    <section className="space-y-4">
      <h3 className={invoiceDialogSectionHeadingClass}>Core billing</h3>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1.5 sm:col-span-1">
          <InvoiceDialogFieldLabel htmlFor="inv-amount" icon={Euro} required>
            Amount (EUR)
          </InvoiceDialogFieldLabel>
          {isEdit && readOnlyAmountCents != null ? (
            <>
              <div
                className={cn(
                  invoiceDialogGlassInputClass,
                  "flex cursor-default items-center bg-violet-50/50 font-semibold text-gray-800"
                )}
              >
                <InvoiceAmountDisplay
                  amountCents={readOnlyAmountCents}
                  currency={readOnlyCurrency}
                />
              </div>
              {visitFeeHintInput ? (
                <p className="text-[11px] text-muted-foreground">
                  {buildInvoiceAmountFeeHint(visitFeeHintInput)}
                </p>
              ) : null}
            </>
          ) : (
            <>
              <Input
                id="inv-amount"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="e.g. 150.00"
                value={amount}
                onChange={(e) => onAmountChange(e.target.value)}
                required
                disabled={disabled}
                className={invoiceDialogGlassInputClass}
              />
              {!isEdit && visitFeeHintInput ? (
                <p className="text-[11px] text-muted-foreground">
                  {buildInvoiceAmountFeeHint(visitFeeHintInput)}
                </p>
              ) : (suggestedAmountCents ?? 0) > 0 ? (
                <p className="text-[11px] text-muted-foreground">
                  Suggested from visit fee — you can override.
                </p>
              ) : null}
            </>
          )}
        </div>
        <div className="space-y-1.5 sm:col-span-1">
          <InvoiceDialogFieldLabel htmlFor="inv-due" icon={CalendarDays}>
            Due date
          </InvoiceDialogFieldLabel>
          <ClinicalGlassDatePicker
            id="inv-due"
            value={dueDate}
            onChange={onDueDateChange}
            disabled={disabled}
            tone="violet"
            align="end"
            placeholder="Select due date"
          />
        </div>
      </div>
      <div className="space-y-1.5">
        <InvoiceDialogFieldLabel htmlFor="inv-desc" icon={FileText}>
          Description
        </InvoiceDialogFieldLabel>
        <Textarea
          id="inv-desc"
          placeholder="Visit invoice"
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          disabled={disabled}
          className={invoiceDialogGlassTextareaClass}
        />
      </div>
    </section>
  );
}
