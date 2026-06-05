import type { Invoice } from "@/hooks/usePayments";

/** Shared invoice action visibility — used by dropdown menu, detail footer, and header actions. */
export function resolveInvoiceDetailActionCapabilities(
  invoice: Invoice,
  viewerRole: "admin" | "doctor"
) {
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
    canSend: invoice.status === "draft",
    canMarkPaid: invoice.status !== "paid" && invoice.status !== "cancelled",
    canCancel: invoice.status !== "paid" && invoice.status !== "cancelled",
    canDelete: invoice.status !== "paid",
    canRefund: viewerRole === "admin" && invoice.status === "paid",
    canEditDetails:
      invoice.status === "draft" ||
      invoice.status === "sent" ||
      invoice.status === "overdue",
  };
}
