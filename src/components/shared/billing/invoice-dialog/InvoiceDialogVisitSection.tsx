"use client";

import { useEffect, useState } from "react";
import { Link2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { InvoiceAppointmentPickerField } from "@/components/shared/billing/InvoiceAppointmentPickerField";
import { InvoiceVisitSummaryCard } from "@/components/shared/billing/invoice-dialog/InvoiceVisitSummaryCard";
import { invoiceDialogSectionHeadingClass } from "@/lib/invoice-dialog-ui-classes";
import { useBillingAppointmentOptionById } from "@/hooks/useBillingAppointmentOptionById";
import type { InvoiceAppointmentOptionRow } from "@/lib/billing-types";
import type { InvoiceVisitSummary } from "@/lib/billing-types";

type Props = {
  variant: "admin" | "doctor";
  mode: "create" | "edit";
  /** Create — linked visit id preset from appointment card/detail. */
  appointmentId?: string;
  apptId: string;
  onApptIdChange: (id: string) => void;
  onSelectionChange: (option: InvoiceAppointmentOptionRow | null) => void;
  selection: InvoiceAppointmentOptionRow | null;
  includeBilled: boolean;
  onIncludeBilledChange?: (value: boolean) => void;
  /** Edit — read-only visit from invoice row. */
  visitSummary?: InvoiceVisitSummary | null;
  disabled?: boolean;
};

/** Visit picker (create) or linked visit summary (edit / preset). */
export function InvoiceDialogVisitSection({
  variant,
  mode,
  appointmentId,
  apptId,
  onApptIdChange,
  onSelectionChange,
  selection,
  includeBilled,
  onIncludeBilledChange,
  visitSummary,
  disabled = false,
}: Props) {
  const [pickerExpanded, setPickerExpanded] = useState(true);
  const isEdit = mode === "edit";
  const presetAppt = Boolean(appointmentId);
  const showSummary =
    !isEdit && !presetAppt && selection && selection.eligible && !pickerExpanded;

  const {
    option: presetOption,
    isLoading: presetLoading,
    isError: presetError,
  } = useBillingAppointmentOptionById(appointmentId, {
    includeBilled: variant === "admin" && includeBilled,
    enabled: presetAppt && !isEdit,
  });

  useEffect(() => {
    if (!presetAppt || isEdit || !presetOption) return;
    onSelectionChange(presetOption);
    if (presetOption.id && presetOption.id !== apptId) {
      onApptIdChange(presetOption.id);
    }
  }, [presetAppt, isEdit, presetOption, apptId, onApptIdChange, onSelectionChange]);

  if (isEdit && visitSummary) {
    return (
      <section className="space-y-3">
        <h3 className={invoiceDialogSectionHeadingClass}>Linked visit</h3>
        <InvoiceVisitSummaryCard source="summary" visit={visitSummary} />
      </section>
    );
  }

  if (presetAppt) {
    return (
      <section className="space-y-3">
        <h3 className={invoiceDialogSectionHeadingClass}>Linked visit</h3>
        {presetLoading ? (
          <VisitPickerSkeleton />
        ) : presetError ? (
          <p className="text-sm text-rose-600">
            Could not load visit details. Check your connection and try again.
          </p>
        ) : presetOption ? (
          <>
            <InvoiceVisitSummaryCard source="option" visit={presetOption} />
            {!presetOption.eligible && (
              <p className="text-sm text-violet-800">
                This visit already has an active invoice — open the existing bill or pick another
                visit.
              </p>
            )}
          </>
        ) : (
          <p className="text-sm text-muted-foreground">
            Visit not found or you do not have access to bill it.
          </p>
        )}
      </section>
    );
  }

  return (
    <section className="space-y-3">
      <h3 className={invoiceDialogSectionHeadingClass}>Linked visit</h3>
      {showSummary && selection ? (
        <InvoiceVisitSummaryCard
          source="option"
          visit={selection}
          onChangeVisit={() => setPickerExpanded(true)}
        />
      ) : (
        <>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Link2 className="h-3.5 w-3.5 text-violet-600" aria-hidden />
            {variant === "admin"
              ? "Pick an unpaid visit — billed visits are hidden unless you enable Show billed visits."
              : "Draft invoice for a visit without an active bill."}
          </div>
          <InvoiceAppointmentPickerField
            variant={variant}
            value={apptId}
            onChange={(id) => {
              onApptIdChange(id);
              if (id) setPickerExpanded(false);
            }}
            onSelectionChange={(opt) => {
              onSelectionChange(opt);
              if (opt?.eligible) setPickerExpanded(false);
            }}
            required
            includeBilled={includeBilled}
            onIncludeBilledChange={onIncludeBilledChange}
            disabled={disabled}
            loadingFallback={<VisitPickerSkeleton />}
          />
        </>
      )}
    </section>
  );
}

function VisitPickerSkeleton() {
  return (
    <div className="space-y-2">
      {[1, 2, 3].map((i) => (
        <Skeleton key={i} className="h-24 w-full rounded-2xl" />
      ))}
    </div>
  );
}
