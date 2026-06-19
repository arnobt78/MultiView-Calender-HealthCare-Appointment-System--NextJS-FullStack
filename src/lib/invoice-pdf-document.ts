/**
 * Printable invoice HTML — shared by `/api/invoices/[id]/pdf` and client download trigger.
 */
import { formatInvoiceMoney } from "@/lib/crud-notify-messages";
import { mapInvoiceIssuedByActor } from "@/lib/invoice-issued-by-display";
import type { Invoice } from "@/hooks/usePayments";
import type { InvoicePaymentRow } from "@/lib/billing-types";

/** Payment table date — refunded rows prefer refunded_at over charge created_at. */
function formatPaymentHistoryDate(payment: InvoicePaymentRow): string {
  const iso =
    payment.status === "refunded" && payment.refunded_at
      ? payment.refunded_at
      : payment.created_at;
  return new Date(iso).toLocaleString("de-DE");
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export function invoicePdfDownloadFilename(invoiceId: string): string {
  return `invoice-${invoiceId.slice(0, 8)}.html`;
}

export function invoicePdfApiUrl(
  invoiceId: string,
  mode: "download" | "print" | "view" = "download"
): string {
  const base = `/api/invoices/${encodeURIComponent(invoiceId)}/pdf`;
  if (mode === "download") return `${base}?download=1`;
  if (mode === "print") return `${base}?print=1`;
  return base;
}

/** Build a self-contained HTML document for print / Save as PDF. */
export function buildInvoicePrintHtml(invoice: Invoice, options?: { autoPrint?: boolean }): string {
  const shortId = invoice.id.slice(0, 8);
  const amount = formatInvoiceMoney({
    amount: invoice.amount,
    currency: invoice.currency,
    unit: "cents",
  });
  const status = escapeHtml(invoice.status);
  const description = escapeHtml(invoice.description?.trim() || "—");
  const patient = escapeHtml(invoice.visit_summary?.patient_label ?? "—");
  const when = escapeHtml(invoice.visit_summary?.when_label ?? "—");
  const location = escapeHtml(invoice.visit_summary?.location_label ?? "—");
  const visitType = escapeHtml(invoice.visit_summary?.appointment_type_name ?? "—");
  const dueDate = invoice.due_date
    ? escapeHtml(new Date(invoice.due_date).toLocaleDateString("de-DE"))
    : "—";
  const created = escapeHtml(new Date(invoice.created_at).toLocaleString("de-DE"));
  const issuer = escapeHtml(mapInvoiceIssuedByActor(invoice)?.label ?? invoice.issuer_label ?? "—");

  const paymentRows = invoice.payments
    .map((p) => {
      const payAmount = formatInvoiceMoney({
        amount: p.amount,
        currency: invoice.currency,
        unit: "cents",
      });
      return `<tr>
        <td>${escapeHtml(formatPaymentHistoryDate(p))}</td>
        <td>${escapeHtml(p.status)}</td>
        <td>${escapeHtml(payAmount)}</td>
      </tr>`;
    })
    .join("");

  const autoPrintScript = options?.autoPrint
    ? `<script>window.addEventListener("load",()=>{window.print();});</script>`
    : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>Invoice #${shortId}</title>
  <style>
    body { font-family: system-ui, sans-serif; color: #1f2937; margin: 2rem; }
    h1 { font-size: 1.5rem; margin: 0 0 0.25rem; }
    .meta { color: #6b7280; font-size: 0.875rem; margin-bottom: 1.5rem; }
    .hint { color: #7c3aed; font-size: 0.75rem; margin-top: 2rem; }
    table { width: 100%; border-collapse: collapse; margin-top: 1rem; }
    th, td { border: 1px solid #e5e7eb; padding: 0.5rem 0.75rem; text-align: left; font-size: 0.875rem; }
    th { background: #f5f3ff; }
    .amount { font-size: 1.25rem; font-weight: 600; }
    @media print { body { margin: 0.5in; } .hint { display: none; } }
  </style>
</head>
<body>
  <h1>Invoice #${shortId}</h1>
  <p class="meta">HealthCal Pro · ${created}</p>
  <p class="amount">${escapeHtml(amount)}</p>
  <table>
    <tbody>
      <tr><th>Status</th><td>${status}</td></tr>
      <tr><th>Invoice ID</th><td>${escapeHtml(invoice.id)}</td></tr>
      <tr><th>Description</th><td>${description}</td></tr>
      <tr><th>Due date</th><td>${dueDate}</td></tr>
      <tr><th>Issued by</th><td>${issuer}</td></tr>
      <tr><th>Patient</th><td>${patient}</td></tr>
      <tr><th>Visit</th><td>${visitType}</td></tr>
      <tr><th>When</th><td>${when}</td></tr>
      <tr><th>Location</th><td>${location}</td></tr>
    </tbody>
  </table>
  ${
    invoice.payments.length
      ? `<h2 style="margin-top:2rem;font-size:1rem;">Payment history</h2>
  <table>
    <thead><tr><th>Date</th><th>Status</th><th>Amount</th></tr></thead>
    <tbody>${paymentRows}</tbody>
  </table>`
      : ""
  }
  <p class="hint">To save as PDF: open this file in your browser → Print → Save as PDF.</p>
  ${autoPrintScript}
</body>
</html>`;
}

/**
 * Download invoice HTML via authenticated API (`Content-Disposition: attachment`).
 * User can open the file and Print → Save as PDF without a popup blocker.
 */
export async function downloadInvoicePdf(invoiceId: string): Promise<void> {
  const res = await fetch(invoicePdfApiUrl(invoiceId, "download"), {
    credentials: "include",
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error("Failed to download invoice");
  }
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  try {
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = invoicePdfDownloadFilename(invoiceId);
    anchor.rel = "noopener";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
  } finally {
    URL.revokeObjectURL(url);
  }
}

/** @deprecated Prefer `downloadInvoicePdf` — opens print preview tab. */
export function openInvoicePdfDownload(invoiceId: string): void {
  window.open(invoicePdfApiUrl(invoiceId, "print"), "_blank", "noopener,noreferrer");
}
