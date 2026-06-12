"use client";

import { Building2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Organization } from "@/hooks/useOrganization";
import {
  filterSelectIconClass,
  filterSelectTriggerToolbarClass,
} from "@/lib/filter-select-classes";
import { countInvoicesForOrganization } from "@/lib/invoice-management-display";
import type { InvoiceRow } from "@/lib/billing-types";
import { cn } from "@/lib/utils";

export const ORGANIZATION_FILTER_ALL_VALUE = "all";

type OrganizationFilterSelectProps = {
  value: string;
  onValueChange: (organizationId: string) => void;
  organizations: readonly Organization[];
  /** All-workspace invoices — optional count badges on org rows. */
  allInvoices?: ReadonlyArray<InvoiceRow>;
  size?: "toolbar";
  triggerClassName?: string;
  disabled?: boolean;
  ariaLabel?: string;
};

/** CP invoice hub — scope by organisation (mutually exclusive with doctor scope). */
export function OrganizationFilterSelect({
  value,
  onValueChange,
  organizations,
  allInvoices = [],
  triggerClassName,
  disabled = false,
  ariaLabel = "Filter by organisation",
}: OrganizationFilterSelectProps) {
  const selected =
    value !== ORGANIZATION_FILTER_ALL_VALUE
      ? organizations.find((o) => o.id === value)
      : undefined;

  return (
    <Select value={value} onValueChange={onValueChange} disabled={disabled}>
      <SelectTrigger
        className={cn(filterSelectTriggerToolbarClass, "min-w-[200px]", triggerClassName)}
        aria-label={ariaLabel}
      >
        <Building2 className={filterSelectIconClass} aria-hidden />
        <SelectValue placeholder="All organisations">
          {selected ? selected.name : "All organisations"}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={ORGANIZATION_FILTER_ALL_VALUE}>All organisations</SelectItem>
        {organizations.map((org) => {
          const count =
            allInvoices.length > 0
              ? countInvoicesForOrganization(allInvoices, org.id)
              : undefined;
          const label =
            count != null && count > 0 ? `${org.name} (${count})` : org.name;
          return (
            <SelectItem key={org.id} value={org.id} textValue={org.name}>
              {label}
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
}
