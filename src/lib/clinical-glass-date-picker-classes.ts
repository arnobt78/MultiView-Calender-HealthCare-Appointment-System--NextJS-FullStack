/**
 * Glass date-picker trigger tokens — violet (invoice) and sky (patient) dialogs.
 */
import { invoiceDialogGlassRowControlBase } from "@/lib/invoice-dialog-ui-classes";
import { patientDialogGlassRowControlBase } from "@/lib/patient-dialog-ui-classes";
import { cn } from "@/lib/utils";

export type ClinicalGlassDatePickerTone = "violet" | "sky";

const toneTriggerClass: Record<ClinicalGlassDatePickerTone, string> = {
  violet: cn(
    invoiceDialogGlassRowControlBase,
    "flex cursor-pointer items-center justify-between gap-2 text-left hover:bg-white/90 focus-visible:border-violet-400/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-200/40"
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
