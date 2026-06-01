"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import type { InvoiceAppointmentOptionRow } from "@/lib/billing-types";
import { InvoiceVisitPickerList } from "@/components/shared/billing/InvoiceVisitPickerList";
import type { EntityRole } from "@/lib/entity-routes";

type Props = {
  value: string;
  onChange: (appointmentId: string) => void;
  onSelectionChange?: (option: InvoiceAppointmentOptionRow | null) => void;
  disabled?: boolean;
  required?: boolean;
  variant: "admin" | "doctor";
  includeBilled?: boolean;
  onIncludeBilledChange?: (value: boolean) => void;
};

/** Search + compact visit list for invoice create (eligibility from GET /api/billing/appointment-options). */
export function InvoiceAppointmentPickerField({
  value,
  onChange,
  onSelectionChange,
  disabled,
  required = false,
  variant,
  includeBilled = false,
  onIncludeBilledChange,
}: Props) {
  const [search, setSearch] = useState("");

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

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-2">
        <Label>
          Link visit{required ? " *" : ""}
        </Label>
        {variant === "admin" && onIncludeBilledChange && (
          <label className="flex cursor-pointer items-center gap-1.5 text-[10px] text-muted-foreground">
            <input
              type="checkbox"
              className="h-3.5 w-3.5 rounded border-gray-300"
              checked={includeBilled}
              onChange={(e) => onIncludeBilledChange(e.target.checked)}
              disabled={disabled}
            />
            Show billed visits
          </label>
        )}
      </div>
      <Input
        placeholder="Search patient or visit title…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        disabled={disabled}
      />
      {isLoading ? (
        <p className="text-xs text-muted-foreground py-2">Loading visits…</p>
      ) : (
        <InvoiceVisitPickerList
          options={options}
          value={value}
          onSelect={(id) => {
            onChange(id);
            onSelectionChange?.(options.find((o) => o.id === id) ?? null);
          }}
          viewerRole={viewerRole}
          disabled={disabled}
        />
      )}
      {selected && selected.eligible && (
        <p className="text-[10px] text-muted-foreground">
          Selected: {selected.patient_label}
        </p>
      )}
      {selected && !selected.eligible && (
        <p className="text-[10px] text-amber-700">
          This visit already has an invoice — pick another or open the existing bill.
        </p>
      )}
    </div>
  );
}
