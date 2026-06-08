"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link2 } from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";
import type { InvoiceAppointmentOptionRow } from "@/lib/billing-types";
import { InvoiceVisitPickerList } from "@/components/shared/billing/InvoiceVisitPickerList";
import { InvoiceVisitSummaryCard } from "@/components/shared/billing/invoice-dialog/InvoiceVisitSummaryCard";
import { StaffAppointmentPickerField } from "@/components/shared/scheduling/StaffAppointmentPickerField";
import { FormRequiredMark } from "@/components/shared/form/FormRequiredMark";
import { invoiceDialogGlassInputClass } from "@/lib/invoice-dialog-ui-classes";
import { Input } from "@/components/ui/input";
import { toTitleCaseLabel } from "@/lib/utils";
import type { EntityRole } from "@/lib/entity-routes";
import type { ReactNode } from "react";

type Props = {
  value: string;
  onChange: (appointmentId: string) => void;
  onSelectionChange?: (option: InvoiceAppointmentOptionRow | null) => void;
  disabled?: boolean;
  required?: boolean;
  variant: "admin" | "doctor";
  includeBilled?: boolean;
  onIncludeBilledChange?: (value: boolean) => void;
  loadingFallback?: ReactNode;
};

/** Collapsible visit picker — StaffAppointmentPickerField violet shell + directory list. */
export function InvoiceAppointmentPickerField({
  value,
  onChange,
  onSelectionChange,
  disabled,
  required = false,
  variant,
  includeBilled = false,
  onIncludeBilledChange,
  loadingFallback,
}: Props) {
  const [search, setSearch] = useState("");
  const [pickerOpen, setPickerOpen] = useState(false);

  const viewerRole: EntityRole = variant === "admin" ? "admin" : "doctor";

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.billing.appointmentOptions(search, includeBilled),
    queryFn: () => {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (includeBilled) params.set("includeBilled", "1");
      const qs = params.toString();
      return apiClient<{ options: InvoiceAppointmentOptionRow[] }>(
        `/api/billing/appointment-options${qs ? `?${qs}` : ""}`
      );
    },
    staleTime: 20_000,
  });

  const options = useMemo(() => data?.options ?? [], [data?.options]);
  const selected = useMemo(
    () => options.find((o) => o.id === value),
    [options, value]
  );

  const handleSelect = (id: string) => {
    onChange(id);
    const opt = options.find((o) => o.id === id) ?? null;
    onSelectionChange?.(opt);
    setPickerOpen(false);
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        {variant === "admin" && onIncludeBilledChange ? (
          <label className="ml-auto flex cursor-pointer items-center gap-1.5 text-[11px] text-muted-foreground">
            <input
              type="checkbox"
              className="h-3.5 w-3.5 rounded border-violet-300 text-violet-600"
              checked={includeBilled}
              onChange={(e) => onIncludeBilledChange(e.target.checked)}
              disabled={disabled}
            />
            Show billed visits
          </label>
        ) : null}
      </div>
      <StaffAppointmentPickerField
        tone="violet"
        icon={Link2}
        label={
          <>
            Link visit
            {required ? <FormRequiredMark /> : null}
          </>
        }
        placeholder={toTitleCaseLabel("Select a visit")}
        triggerValue={
          selected
            ? `${selected.patient_label} · ${selected.when_label ?? selected.appointment_type_name ?? "Visit"}`
            : undefined
        }
        selectedContent={
          selected ? (
            <InvoiceVisitSummaryCard
              source="option"
              visit={selected}
              viewerRole={variant}
              onChangeVisit={() => setPickerOpen(true)}
            />
          ) : undefined
        }
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        changeLabel={toTitleCaseLabel("Change visit")}
        disabled={disabled}
      >
        <div className="space-y-2 p-1">
          <Input
            id="inv-visit-search"
            placeholder="Search patient or visit…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            disabled={disabled}
            className={invoiceDialogGlassInputClass}
            aria-label="Search billable visits"
          />
          {isLoading ? (
            loadingFallback ?? (
              <p className="py-4 text-center text-xs text-muted-foreground">Loading visits…</p>
            )
          ) : (
            <InvoiceVisitPickerList
              options={options}
              value={value}
              onSelect={handleSelect}
              viewerRole={viewerRole}
              disabled={disabled}
            />
          )}
        </div>
      </StaffAppointmentPickerField>
      {selected && !selected.eligible ? (
        <p className="text-[10px] text-violet-800">
          This visit already has an invoice — pick another or open the existing bill.
        </p>
      ) : null}
    </div>
  );
}
