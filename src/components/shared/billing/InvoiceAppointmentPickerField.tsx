"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { apiClient } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type InvoiceAppointmentOption = {
  id: string;
  title: string;
  start: string;
  end: string;
  owner_id: string;
  patient_label: string;
};

type Props = {
  value: string;
  onChange: (appointmentId: string) => void;
  disabled?: boolean;
};

/** Searchable appointment select for invoice create (admin global / doctor scoped API). */
export function InvoiceAppointmentPickerField({ value, onChange, disabled }: Props) {
  const [search, setSearch] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.billing.appointmentOptions(search),
    queryFn: () =>
      apiClient<{ options: InvoiceAppointmentOption[] }>(
        `/api/billing/appointment-options?search=${encodeURIComponent(search)}`
      ),
    staleTime: 20_000,
  });

  const options = useMemo(() => data?.options ?? [], [data?.options]);
  const selected = useMemo(
    () => options.find((o) => o.id === value),
    [options, value]
  );

  return (
    <div className="space-y-1.5">
      <Label>Link appointment (optional)</Label>
      <Input
        placeholder="Search by title…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        disabled={disabled}
        className="mb-1"
      />
      <Select
        value={value || "__none__"}
        onValueChange={(v) => onChange(v === "__none__" ? "" : v)}
        disabled={disabled || isLoading}
      >
        <SelectTrigger>
          <SelectValue
            placeholder={isLoading ? "Loading visits…" : "Select a visit"}
          />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="__none__">No appointment</SelectItem>
          {options.map((opt) => (
            <SelectItem key={opt.id} value={opt.id}>
              {opt.title} — {opt.patient_label} (
              {format(new Date(opt.start), "dd MMM yyyy")})
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {selected && (
        <p className="text-[10px] text-muted-foreground">
          Selected: {selected.title} · {format(new Date(selected.start), "PPp")}
        </p>
      )}
    </div>
  );
}
