"use client";

import { EntityTitleLink } from "@/components/shared/EntityTitleLink";
import { AppointmentStatusGlassBadge } from "@/components/shared/appointments/AppointmentStatusGlassBadge";
import { linkedAppointmentStatusFromInvoice } from "@/lib/visit-billing-action-gates";
import { cn } from "@/lib/utils";

type Props = {
  href: string;
  title: string;
  invoice?: { visit_summary?: { appointment_status?: string | null } | null };
  appointmentStatus?: string | null;
  wrapLabel?: boolean;
  linkClassName?: string;
  className?: string;
};

/** Invoice list/table title + linked visit status — single source across cards and columns. */
export function InvoiceVisitTitleRow({
  href,
  title,
  invoice,
  appointmentStatus,
  wrapLabel = true,
  linkClassName,
  className,
}: Props) {
  const status =
    appointmentStatus ?? (invoice ? linkedAppointmentStatusFromInvoice(invoice) : null);

  return (
    <div
      className={cn(
        "flex min-w-0 max-w-full flex-wrap items-center gap-x-2 gap-y-1",
        className
      )}
    >
      <EntityTitleLink
        href={href}
        label={title}
        wrapLabel={wrapLabel}
        className={cn("min-w-0 font-normal", linkClassName)}
      />
      {status ? <AppointmentStatusGlassBadge status={status} size="compact" /> : null}
    </div>
  );
}
