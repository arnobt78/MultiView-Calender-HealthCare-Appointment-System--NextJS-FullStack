"use client";

import { ArrowLeft, Download, FileOutput } from "lucide-react";
import { BackNavigationLink } from "@/components/shared/BackNavigationLink";
import { ControlPanelGlassActionButton } from "@/components/shared/ControlPanelGlassActionButton";
import { useInvoice } from "@/hooks/useInvoice";
import { usePayments, type Invoice } from "@/hooks/usePayments";
import { resolveInvoiceDetailActionCapabilities } from "@/lib/invoice-detail-action-capabilities";
import type { InvoiceDetailUiAccess } from "@/lib/invoice-detail-ssr";
import { openInvoicePdfDownload } from "@/lib/invoice-pdf-document";
import {
  invoiceDetailBackButtonClass,
  invoiceDetailHeaderActionsClass,
} from "@/lib/invoice-detail-ui-classes";
import { cn } from "@/lib/utils";
import { useMemo } from "react";

type Props = {
  initialInvoice: Invoice;
  accessLevel: InvoiceDetailUiAccess;
  backHref: string;
  invoicesInitialData?: Invoice[];
};

/**
 * Invoice detail chrome actions — Back + Generate (send draft) + Download PDF.
 * Shown for admin, doctor, and patient portal invoice detail.
 */
export function InvoiceDetailHeaderActions({
  initialInvoice,
  accessLevel,
  backHref,
  invoicesInitialData,
}: Props) {
  const { data: invoice = initialInvoice } = useInvoice(initialInvoice.id, {
    initialData: initialInvoice,
  });
  const { updateInvoice, isUpdating } = usePayments({ invoicesInitialData });

  const capsRole = accessLevel === "admin" ? "admin" : "doctor";
  const caps = useMemo(
    () => resolveInvoiceDetailActionCapabilities(invoice, capsRole),
    [invoice, capsRole]
  );

  const canGenerate =
    caps.canGenerateInvoice &&
    caps.canSend &&
    (accessLevel === "admin" || accessLevel === "mutate");

  return (
    <div className={invoiceDetailHeaderActionsClass}>
      {canGenerate ? (
        <ControlPanelGlassActionButton
          type="button"
          variant="sky"
          disabled={isUpdating}
          onClick={() => updateInvoice({ invoiceId: invoice.id, body: { status: "sent" } })}
        >
          <FileOutput className="shrink-0" aria-hidden />
          {isUpdating ? "Generating…" : "Generate invoice"}
        </ControlPanelGlassActionButton>
      ) : null}

      {caps.canDownloadPdf ? (
        <ControlPanelGlassActionButton
          type="button"
          variant="violet"
          onClick={() => openInvoicePdfDownload(invoice.id)}
        >
          <Download className="shrink-0" aria-hidden />
          Download invoice
        </ControlPanelGlassActionButton>
      ) : null}

      <BackNavigationLink
        href={backHref}
        className={cn(invoiceDetailBackButtonClass, "no-underline")}
      >
        <ArrowLeft className="shrink-0" aria-hidden />
        Back
      </BackNavigationLink>
    </div>
  );
}
