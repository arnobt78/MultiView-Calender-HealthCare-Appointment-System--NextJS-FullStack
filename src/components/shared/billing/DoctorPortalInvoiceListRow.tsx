"use client";

import { useQuery } from "@tanstack/react-query";
import { PrefetchingLink } from "@/components/shared/PrefetchingLink";
import { InvoiceAmountDisplay } from "@/components/shared/billing/InvoiceAmountDisplay";
import { InvoiceStatusBadge } from "@/components/shared/billing/InvoiceStatusBadge";
import { InvoiceAdminActionsMenu } from "@/components/shared/billing/InvoiceAdminActionsMenu";
import { InvoiceIssuedByMeta } from "@/components/shared/billing/InvoiceIssuedByMeta";
import { InvoiceListPatientStrip } from "@/components/shared/billing/InvoiceListPatientStrip";
import { InvoiceVisitListMeta } from "@/components/shared/billing/InvoiceVisitListMeta";
import { getInvoiceAppointmentTitle } from "@/lib/invoice-list-row-display";
import { invoiceDetailHref, patientDetailHref } from "@/lib/entity-routes";
import { entityDetailLinkClass } from "@/lib/table-display-styles";
import { queryKeys } from "@/lib/query-keys";
import type { Patient } from "@/types/types";
import type { Invoice } from "@/hooks/usePayments";
import { cn } from "@/lib/utils";

type Props = {
  invoice: Invoice;
  onSend: (id: string) => void;
  onDelete: (id: string) => void;
  isUpdating?: boolean;
};

export const doctorPortalInvoiceListRowClass =
  "border-b border-border/40 py-2 last:border-0";

/** Title · patient · visit meta · invoice issued (bottom). */
export function DoctorPortalInvoiceListRow({
  invoice,
  onSend,
  onDelete,
  isUpdating,
}: Props) {
  const summary = invoice.visit_summary;
  const appointmentTitle = getInvoiceAppointmentTitle(invoice);
  const href = invoiceDetailHref("doctor", invoice.id);

  const { data: patients } = useQuery<Patient[]>({
    queryKey: queryKeys.patients.all,
    queryFn: async () => [],
    staleTime: Infinity,
    enabled: false,
  });

  const patientFromCache =
    summary?.patient_id && patients?.length
      ? patients.find((p) => p.id === summary.patient_id)
      : undefined;

  const patientPortrait =
    patientFromCache ??
    (summary?.patient_id
      ? {
          id: summary.patient_id,
          email: summary.patient_email ?? null,
          clinical_profile: null,
          birth_date: summary.patient_birth_date ?? null,
          firstname: summary.patient_label?.split(" ")[0],
          lastname: summary.patient_label?.split(" ").slice(1).join(" "),
        }
      : null);

  const patientHref = summary?.patient_id
    ? patientDetailHref("doctor", summary.patient_id)
    : href;

  return (
    <li className={doctorPortalInvoiceListRowClass}>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <PrefetchingLink
            href={href}
            className={cn(entityDetailLinkClass, "min-w-0 flex-1 truncate text-sm font-normal")}
          >
            {appointmentTitle}
          </PrefetchingLink>
          <div className="flex shrink-0 items-center gap-1.5">
            <InvoiceAmountDisplay
              amountCents={invoice.amount}
              currency={invoice.currency}
              className="text-sm font-normal tabular-nums text-emerald-700"
            />
            <InvoiceStatusBadge invoice={invoice} />
            <InvoiceAdminActionsMenu
              invoice={invoice}
              viewerRole="doctor"
              onSend={onSend}
              onDelete={onDelete}
              isUpdating={isUpdating}
            />
          </div>
        </div>

        {summary?.patient_label && patientPortrait ? (
          <InvoiceListPatientStrip
            className="mt-0.5"
            name={summary.patient_label}
            email={summary.patient_email}
            birthDate={summary.patient_birth_date}
            careLevel={summary.patient_care_level}
            patientHref={patientHref}
            patientPortrait={patientPortrait}
            categoryId={summary.category_id}
            categoryLabel={summary.category_label}
            categoryColor={summary.category_color}
            categoryIcon={summary.category_icon}
          />
        ) : null}

        {summary ? <InvoiceVisitListMeta summary={summary} className="mt-0.5" /> : null}

        <InvoiceIssuedByMeta
          className="mt-0.5"
          createdAt={invoice.created_at}
          issuerLabel={invoice.issuer_label}
          issuerImage={invoice.issuer_image}
        />
      </div>
    </li>
  );
}
