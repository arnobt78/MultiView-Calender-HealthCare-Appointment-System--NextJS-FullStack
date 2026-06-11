"use client";

import { InvoicePortalListCard } from "@/components/shared/billing/InvoicePortalListCard";
import { InvoiceAdminActionsMenu } from "@/components/shared/billing/InvoiceAdminActionsMenu";
import type { Invoice } from "@/hooks/usePayments";
import {
  doctorPortalInvoiceHeaderStripClass,
  doctorPortalInvoiceListItemShellClass,
} from "@/lib/doctor-portal-layout";

type Props = {
  invoice: Invoice;
  viewerUserId?: string;
  onSend: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit?: (invoice: Invoice) => void;
  isUpdating?: boolean;
};

/** Doctor portal billing list — wraps shared InvoicePortalListCard (sky tokens). */
export function DoctorPortalInvoiceListRow({
  invoice,
  viewerUserId,
  onSend,
  onDelete,
  onEdit,
  isUpdating,
}: Props) {
  const viewerRole = "doctor" as const;

  return (
    <li className="w-full min-w-0">
      <InvoicePortalListCard
        invoice={invoice}
        viewerRole={viewerRole}
        shellClassName={doctorPortalInvoiceListItemShellClass}
        headerStripClassName={doctorPortalInvoiceHeaderStripClass}
        headerActions={
          <InvoiceAdminActionsMenu
            invoice={invoice}
            viewerRole={viewerRole}
            viewerUserId={viewerUserId}
            onEdit={onEdit}
            onSend={onSend}
            onDelete={onDelete}
            isUpdating={isUpdating}
          />
        }
      />
    </li>
  );
}
