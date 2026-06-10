"use client";

import { Download, FileOutput } from "lucide-react";
import { useMemo, useState } from "react";
import { EntityDetailBackLink } from "@/components/shared/entity-detail/EntityDetailBackLink";
import { ControlPanelGlassActionButton } from "@/components/shared/ControlPanelGlassActionButton";
import { useInvoice } from "@/hooks/useInvoice";
import { usePayments, type Invoice } from "@/hooks/usePayments";
import {
  resolveInvoiceDetailActionCapabilities,
  resolveInvoiceDetailGenerateInHeader,
} from "@/lib/invoice-detail-action-capabilities";
import type { InvoiceDetailUiAccess } from "@/lib/invoice-detail-ssr";
import { downloadInvoicePdf } from "@/lib/invoice-pdf-document";
import { notify } from "@/lib/notify";
import {
  invoiceDetailBackButtonClass,
  invoiceDetailHeaderActionsClass,
} from "@/lib/invoice-detail-ui-classes";

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
  const [isDownloading, setIsDownloading] = useState(false);

  const capsRole = accessLevel === "admin" ? "admin" : "doctor";
  const caps = useMemo(
    () => resolveInvoiceDetailActionCapabilities(invoice, capsRole),
    [invoice, capsRole]
  );

  const canGenerate = resolveInvoiceDetailGenerateInHeader(accessLevel, caps);

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
          {isUpdating ? "Generating…" : "Generate Invoice"}
        </ControlPanelGlassActionButton>
      ) : null}

      {caps.canDownloadPdf ? (
        <ControlPanelGlassActionButton
          type="button"
          variant="violet"
          disabled={isDownloading}
          onClick={async () => {
            setIsDownloading(true);
            try {
              await downloadInvoicePdf(invoice.id);
            } catch {
              notify.error({
                title: "Could not download invoice",
                subtitle: "Please try again.",
              });
            } finally {
              setIsDownloading(false);
            }
          }}
        >
          <Download className="shrink-0" aria-hidden />
          {isDownloading ? "Downloading…" : "Download Invoice"}
        </ControlPanelGlassActionButton>
      ) : null}

      <EntityDetailBackLink
        href={backHref}
        placement="header"
        backButtonClassName={invoiceDetailBackButtonClass}
      />
    </div>
  );
}
