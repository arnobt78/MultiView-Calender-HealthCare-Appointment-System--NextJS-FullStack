import type { Invoice } from "@/hooks/usePayments";
import type { InvoiceDetailUiAccess } from "@/lib/invoice-detail-ssr";
import type { InvoiceVisitSummary } from "@/lib/billing-types";
import {
  isVisitBillingFrozen,
  linkedAppointmentStatusFromInvoice,
} from "@/lib/visit-billing-action-gates";
import { isInvoiceSoftDeleted } from "@/lib/invoice-status-display";

export type InvoiceDetailActionCapabilities = ReturnType<
  typeof resolveInvoiceDetailActionCapabilities
>;

export type ResolveInvoiceDetailActionCapabilitiesOpts = {
  /** Signed-in doctor id — gates mutate menu items to linked visit roles. */
  viewerUserId?: string;
  /** When omitted, read from `invoice.visit_summary.appointment_status`. */
  linkedAppointmentStatus?: string | null;
};

type DoctorMutateInvoicePick = Pick<Invoice, "user_id" | "appointment_id"> & {
  visit_summary?: InvoiceVisitSummary | null;
};

/** Doctor mutate UI — issuer, treating physician, or calendar owner on linked visit. */
export function doctorCanMutateInvoice(
  invoice: DoctorMutateInvoicePick,
  viewerUserId: string | null | undefined
): boolean {
  if (!viewerUserId) return false;
  if (invoice.user_id === viewerUserId) return true;
  const summary = invoice.visit_summary;
  if (summary?.treating_physician_id === viewerUserId) return true;
  if (summary?.calendar_owner_id === viewerUserId) return true;
  return false;
}

/** Shared invoice action visibility — used by dropdown menu, detail footer, and header actions. */
export function resolveInvoiceDetailActionCapabilities(
  invoice: Invoice,
  viewerRole: "admin" | "doctor",
  opts?: ResolveInvoiceDetailActionCapabilitiesOpts
) {
  if (isInvoiceSoftDeleted(invoice)) {
    return {
      canGenerateInvoice: false,
      canDownloadPdf: false,
      canPay: false,
      canSend: false,
      canMarkPaid: false,
      canCancel: false,
      canDelete: false,
      canRefund: false,
      canEditDetails: false,
    };
  }

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

  const caps = {
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
    canRefund:
      invoice.status === "paid" &&
      (viewerRole === "admin" ||
        (viewerRole === "doctor" && doctorCanMutateInvoice(invoice, opts?.viewerUserId))),
    canEditDetails: statusAllowsEdit && (viewerRole === "admin" || doctorMutate),
  };

  const linkedStatus =
    opts?.linkedAppointmentStatus ?? linkedAppointmentStatusFromInvoice(invoice);
  if (!isVisitBillingFrozen(linkedStatus)) return caps;

  return {
    ...caps,
    canGenerateInvoice: false,
    canSend: false,
    canCancel: false,
    canEditDetails: false,
    canMarkPaid: false,
    canPay: false,
    canDelete: viewerRole === "admin" && invoice.status === "draft",
    // Paid refund still allowed when visit is cancelled (REQ-0112).
    canRefund: caps.canRefund,
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
