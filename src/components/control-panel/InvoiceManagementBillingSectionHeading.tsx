"use client";

import { useMemo } from "react";
import type { ReactNode } from "react";
import { Receipt } from "lucide-react";
import { PortalPanelSubsectionHeader } from "@/components/shared/PortalPanelSubsectionHeader";
import { InvoiceStatusCountInlineRow } from "@/components/shared/billing/InvoiceStatusCountInlineRow";
import type { Invoice } from "@/hooks/usePayments";
import {
  countInvoicesByDisplayStatus,
  invoiceManagementSectionSubtitle,
  invoiceManagementSectionTitle,
} from "@/lib/invoice-management-display";
import type { InvoiceManagementFilterKey } from "@/lib/invoice-management-scope";

const invoiceManagementBillingHeaderIconClass =
  "border-amber-100 bg-amber-50 [&_svg]:text-amber-600";

type Props = {
  filter: InvoiceManagementFilterKey;
  invoices: ReadonlyArray<Invoice>;
  countSkeleton?: boolean;
  organizationName?: string | null;
  doctorDisplayName?: string | null;
  /** Org/doctor scope filters + scope reset — inline on the title row. */
  headerActions?: ReactNode;
};

/** CP invoice hub — possessive title + inline status counts + scope filter controls. */
export function InvoiceManagementBillingSectionHeading({
  filter,
  invoices,
  countSkeleton = false,
  organizationName,
  doctorDisplayName,
  headerActions,
}: Props) {
  const statusCounts = useMemo(
    () => countInvoicesByDisplayStatus(invoices),
    [invoices]
  );

  const title = invoiceManagementSectionTitle(filter, {
    organizationName,
    doctorDisplayName,
  });
  const subtitle = invoiceManagementSectionSubtitle(filter);

  return (
    <PortalPanelSubsectionHeader
      id="invoice-management-billing-heading"
      title={title}
      subtitle={subtitle}
      icon={Receipt}
      iconClassName={invoiceManagementBillingHeaderIconClass}
      count={invoices.length}
      countSkeleton={countSkeleton}
      statusChip={<InvoiceStatusCountInlineRow counts={statusCounts} />}
      statusChipSkeleton={countSkeleton}
      headerActions={headerActions}
    />
  );
}
