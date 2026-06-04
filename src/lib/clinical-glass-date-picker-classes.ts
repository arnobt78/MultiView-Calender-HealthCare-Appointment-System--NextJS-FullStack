/**
 * Glass date-picker trigger tokens — amber (invoice) and sky/emerald (patient) dialogs.
 */
import { invoiceDialogGlassRowControlBase } from "@/lib/invoice-dialog-ui-classes";
import { patientDialogGlassRowControlBase } from "@/lib/patient-dialog-ui-classes";
import { cn } from "@/lib/utils";

export type ClinicalGlassDatePickerTone = "amber" | "sky";

const toneTriggerClass: Record<ClinicalGlassDatePickerTone, string> = {
  amber: cn(
    invoiceDialogGlassRowControlBase,
    "flex cursor-pointer items-center justify-between gap-2 text-left hover:bg-white/90 focus-visible:border-amber-400/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-200/40"
  ),
  sky: cn(
    patientDialogGlassRowControlBase,
    "flex cursor-pointer items-center justify-between gap-2 text-left hover:bg-white/90 focus-visible:border-emerald-400/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-200/40"
  ),
};

export function clinicalGlassDatePickerTriggerClass(
  tone: ClinicalGlassDatePickerTone
): string {
  return toneTriggerClass[tone];
}

export const clinicalGlassDatePickerPlaceholderClass = "text-gray-500";
