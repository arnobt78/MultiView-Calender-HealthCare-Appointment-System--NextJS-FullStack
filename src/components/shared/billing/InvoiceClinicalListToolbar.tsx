"use client";

import { ClinicalListFilterToolbar } from "@/components/shared/filters/ClinicalListFilterToolbar";
import { FilterSelect } from "@/components/shared/filters/FilterSelect";
import type { InvoiceStatusFilter } from "@/lib/invoice-management-filters";
import { APP_INNER_SCROLL_STICKY_TOP_CLASS } from "@/lib/portal-z-index";
import {
  findFilterOptionLabel,
  invoiceStatusFilterOptions,
} from "@/lib/filter-select-option-presets";

const INVOICE_STATUS_OPTIONS = invoiceStatusFilterOptions();

type InvoiceClinicalListToolbarProps = {
  listSearch: string;
  setListSearch: (value: string) => void;
  status: InvoiceStatusFilter;
  setStatus: (value: InvoiceStatusFilter) => void;
  hasToolbarFilters: boolean;
  resetToolbar: () => void;
  sticky?: boolean;
};

/** Search + status row — same chrome as CP invoice-management hub. */
export function InvoiceClinicalListToolbar({
  listSearch,
  setListSearch,
  status,
  setStatus,
  hasToolbarFilters,
  resetToolbar,
  sticky = false,
}: InvoiceClinicalListToolbarProps) {
  return (
    <ClinicalListFilterToolbar
      stickyClassName={sticky ? APP_INNER_SCROLL_STICKY_TOP_CLASS : undefined}
      search={{
        value: listSearch,
        onChange: setListSearch,
        placeholder: "Search… (patient, visit title, invoice #)",
        ariaLabel: "Search invoices",
      }}
      showReset={hasToolbarFilters}
      onReset={resetToolbar}
    >
      <FilterSelect
        value={status}
        onValueChange={(v) => setStatus(v as InvoiceStatusFilter)}
        displayLabel={findFilterOptionLabel(INVOICE_STATUS_OPTIONS, status, "All Statuses")}
        size="toolbar"
        triggerClassName="max-w-[200px]"
        ariaLabel="Filter by invoice status"
        options={INVOICE_STATUS_OPTIONS}
      />
    </ClinicalListFilterToolbar>
  );
}
