import type { Invoice } from "@/hooks/usePayments";
import type { InvoiceDetailUiAccess } from "@/lib/invoice-detail-ssr";

export type InvoiceDetailActionCapabilities = ReturnType<
  typeof resolveInvoiceDetailActionCapabilities
>;

export type ResolveInvoiceDetailActionCapabilitiesOpts = {
  /** Signed-in doctor id — gates mutate menu items to invoice issuer (invoice.user_id). */
  viewerUserId?: string;
};

/** Doctor mutate UI — issuer only; mirrors resolveInvoiceAccess mutate rule. */
export function doctorCanMutateInvoice(
  invoice: Pick<Invoice, "user_id">,
  viewerUserId: string | null | undefined
): boolean {
  return Boolean(viewerUserId && invoice.user_id === viewerUserId);
}

/** Shared invoice action visibility — used by dropdown menu, detail footer, and header actions. */
export function resolveInvoiceDetailActionCapabilities(
  invoice: Invoice,
  viewerRole: "admin" | "doctor",
  opts?: ResolveInvoiceDetailActionCapabilitiesOpts
) {
  const statusAllowsEdit =
    invoice.status === "draft" ||
    invoice.status === "sent" ||
    invoice.status === "overdue";
  const statusAllowsWrite =
    invoice.status !== "paid" && invoice.status !== "cancelled";

  const doctorMutate =
    viewerRole === "doctor" && opts?.viewerUserId != null
      ? doctorCanMutateInvoice(invoice, opts.viewerUserId)
      : viewerRole === "doctor";

  return {
    /** Draft → sent; shown as "Generate invoice" in detail header. */
    canGenerateInvoice: invoice.status === "draft",
    /** All roles with invoice access may open the printable PDF route. */
    canDownloadPdf: true,
    canPay:
      viewerRole === "admin" &&
      (invoice.status === "draft" ||
        invoice.status === "sent" ||
        invoice.status === "overdue"),
    canSend: invoice.status === "draft" && (viewerRole === "admin" || doctorMutate),
    canMarkPaid: statusAllowsWrite && viewerRole === "admin",
    canCancel: statusAllowsWrite && (viewerRole === "admin" || doctorMutate),
    canDelete: invoice.status !== "paid" && (viewerRole === "admin" || doctorMutate),
    canRefund: viewerRole === "admin" && invoice.status === "paid",
    canEditDetails: statusAllowsEdit && (viewerRole === "admin" || doctorMutate),
  };
}

/** Draft send lives in chrome header on invoice detail — admin/doctor mutate only. */
export function resolveInvoiceDetailGenerateInHeader(
  accessLevel: InvoiceDetailUiAccess,
  caps: InvoiceDetailActionCapabilities
): boolean {
  return (
    caps.canGenerateInvoice &&
    caps.canSend &&
    (accessLevel === "admin" || accessLevel === "mutate")
  );
}

/** Footer Send hidden when header already exposes Generate (avoids duplicate draft→sent). */
export function resolveInvoiceDetailSendInFooter(
  accessLevel: InvoiceDetailUiAccess,
  caps: InvoiceDetailActionCapabilities
): boolean {
  return caps.canSend && !resolveInvoiceDetailGenerateInHeader(accessLevel, caps);
}
