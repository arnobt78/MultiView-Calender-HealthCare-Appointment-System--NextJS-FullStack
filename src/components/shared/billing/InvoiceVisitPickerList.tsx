"use client";

import { cn } from "@/lib/utils";
import type { InvoiceAppointmentOptionRow } from "@/lib/billing-types";
import type { EntityRole } from "@/lib/entity-routes";
import { InvoiceVisitPickerCard } from "@/components/shared/billing/invoice-dialog/InvoiceVisitPickerCard";
import { invoiceDialogDropdownPanelClass, invoiceDialogPickerScrollClass } from "@/lib/invoice-dialog-ui-classes";

type Props = {
  options: InvoiceAppointmentOptionRow[];
  value: string;
  onSelect: (appointmentId: string) => void;
  viewerRole: EntityRole;
  disabled?: boolean;
};

/** Rich visit list for invoice create — delegates rows to `InvoiceVisitPickerCard`. */
export function InvoiceVisitPickerList({
  options,
  value,
  onSelect,
  viewerRole,
  disabled = false,
}: Props) {
  if (options.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-amber-200/60 px-4 py-6 text-center text-xs text-muted-foreground">
        No billable visits match. Try search or enable &quot;Show billed visits&quot; (admin).
      </p>
    );
  }

  return (
    <div className={cn(invoiceDialogDropdownPanelClass, "p-1")}>
      <ul className={invoiceDialogPickerScrollClass}>
        {options.map((opt) => (
          <li key={opt.id}>
            <InvoiceVisitPickerCard
              option={opt}
              selected={value === opt.id}
              disabled={disabled}
              viewerRole={viewerRole}
              onSelect={() => onSelect(opt.id)}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
